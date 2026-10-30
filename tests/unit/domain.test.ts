import { describe, expect, it } from 'vitest';
import { BookingStore, overlaps } from '../../src/domain.js';
const slot = { roomId: 'cedar', start: '2030-05-20T10:00:00Z', end: '2030-05-20T11:00:00Z' };
describe('reservation behavior', () => {
  it.each([
    ['09:30', '10:30', true], ['10:15', '10:45', true], ['09:00', '12:00', true],
    ['10:00', '11:00', true], ['11:00', '12:00', false], ['09:00', '10:00', false],
  ])('classifies %s–%s independently of implementation', (start, end, expected) => {
    expect(overlaps(slot, { start: `2030-05-20T${start}:00Z`, end: `2030-05-20T${end}:00Z` })).toBe(expected);
  });
  it('rejects overlapping reservations in the same room', () => {
    const store = new BookingStore(); store.create('alice', slot);
    expect(() => store.create('bob', slot)).toThrow('CONFLICT');
  });
  it('allows adjacent reservations and simultaneous use of different rooms', () => {
    const store = new BookingStore(); store.create('alice', slot);
    store.create('bob', { ...slot, roomId: 'olive' });
    store.create('bob', { ...slot, start: slot.end, end: '2030-05-20T12:00:00Z' });
    expect(store.list()).toHaveLength(3);
  });
  it('normalizes timezone offsets before comparing', () => {
    const store = new BookingStore(); store.create('alice', slot);
    expect(() => store.create('bob', { ...slot, start: '2030-05-20T07:00:00-03:00', end: '2030-05-20T08:00:00-03:00' })).toThrow('CONFLICT');
  });
  it.each([null, {}, { ...slot, end: slot.start }, { ...slot, start: 'invalid' }, { ...slot, roomId: 'missing' }, { ...slot, end: '2030-02-30T11:00:00Z' }])('rejects invalid input %j', input => {
    expect(() => new BookingStore().create('alice', input)).toThrow('VALIDATION_ERROR');
  });
  it('forbids cancellation by another user', () => {
    const store = new BookingStore(); const booking = store.create('alice', slot);
    expect(() => store.cancel('bob', booking.id)).toThrow('FORBIDDEN');
    expect(store.list()).toHaveLength(1);
  });
  it('allows the owner to cancel and releases the slot', () => {
    const store = new BookingStore(); const booking = store.create('alice', slot);
    store.cancel('alice', booking.id); expect(store.list()).toHaveLength(0);
    expect(store.create('bob', slot).userId).toBe('bob');
  });
  it('returns defensive copies', () => {
    const store = new BookingStore(); const booking = store.create('alice', slot);
    booking.userId = 'bob'; store.list()[0]!.userId = 'bob';
    expect(store.list()[0]!.userId).toBe('alice');
  });
});
