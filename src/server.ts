import { createApp } from './app.js';
const port=Number(process.env.PORT ?? 4317);
if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('Invalid PORT');
const server=createApp();
server.listen(port,'127.0.0.1',()=>console.log(`Reservation lab: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>{ server.close(); server.closeAllConnections(); });
