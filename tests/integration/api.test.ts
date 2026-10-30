import { afterEach, beforeEach, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createApp } from '../../src/app.js';
let server: ReturnType<typeof createApp>; let base: string;
const slot = { roomId: 'cedar', start: '2030-05-20T10:00:00Z', end: '2030-05-20T11:00:00Z' };
beforeEach(async () => {
  server = createApp(); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterEach(async () => { server.closeAllConnections(); await new Promise<void>((resolve,reject) => server.close(e => e ? reject(e) : resolve())); });
const call = (path: string, method='GET', user='alice', body?: unknown) => fetch(base + path, {
  method, headers: { 'x-demo-user': user, 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
it('creates and lists the documented contract', async () => {
  const response = await call('/api/v1/bookings', 'POST', 'alice', slot);
  expect(response.status).toBe(201); const payload = await response.json();
  expect(payload.data).toMatchObject({ userId: 'alice', roomId: 'cedar', start: '2030-05-20T10:00:00.000Z' });
  expect(payload.meta.requestId).toEqual(expect.any(String));
  const list = await (await call('/api/v1/bookings')).json();
  expect(list.data).toEqual([payload.data]); expect(list.pagination.total).toBe(1);
});
it('rejects concurrent overlapping requests with 409', async () => {
  const results = await Promise.all([call('/api/v1/bookings', 'POST', 'alice', slot), call('/api/v1/bookings', 'POST', 'bob', slot)]);
  expect(results.map(r => r.status).sort()).toEqual([201,409]);
});
it('returns 403 and preserves the booking when another user cancels', async () => {
  const { data } = await (await call('/api/v1/bookings', 'POST', 'alice', slot)).json();
  const response = await call(`/api/v1/bookings/${data.id}`, 'DELETE', 'bob');
  expect(response.status).toBe(403); expect((await response.json()).error.code).toBe('FORBIDDEN');
  expect((await (await call('/api/v1/bookings')).json()).data).toHaveLength(1);
  expect((await call(`/api/v1/bookings/${data.id}`, 'DELETE')).status).toBe(204);
});
it('loads the runtime room catalogue with the expected capacities', async () => {
  const response = await call('/api/v1/rooms'); expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual([{ id: 'cedar', name: 'Sala Cedro', capacity: 6 }, { id: 'olive', name: 'Sala Oliveira', capacity: 4 }]);
});
it('rejects a missing or invented demo identity', async () => {
  expect((await fetch(base + '/api/v1/bookings')).status).toBe(401);
  expect((await call('/api/v1/bookings', 'GET', 'mallory')).status).toBe(401);
});
it('does not accept owner spoofing through the request body', async () => {
  const response = await call('/api/v1/bookings', 'POST', 'alice', {...slot, userId:'bob'});
  expect(response.status).toBe(422);
});
it('rejects malformed JSON, invalid input and unsupported media types', async () => {
  expect((await fetch(base+'/api/v1/bookings', {method:'POST',headers:{'x-demo-user':'alice','content-type':'application/json'},body:'{'})).status).toBe(400);
  expect((await call('/api/v1/bookings', 'POST', 'alice', {})).status).toBe(422);
  expect((await fetch(base+'/api/v1/bookings', {method:'POST',headers:{'x-demo-user':'alice'},body:'hello'})).status).toBe(415);
});
it('rejects oversized bodies', async () => {
  expect((await call('/api/v1/bookings','POST','alice',{...slot,extra:'x'.repeat(20_000)})).status).toBe(413);
});
it('does not expose arbitrary files or an unknown reservation', async () => {
  expect((await call('/package.json')).status).toBe(404);
  expect((await call('/api/v1/bookings/missing','DELETE')).status).toBe(404);
});
