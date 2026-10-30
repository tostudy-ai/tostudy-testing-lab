import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { BookingStore, LabError, loadRooms } from './domain.js';
function body(req: IncomingMessage): Promise<unknown> {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new LabError(415,'UNSUPPORTED_MEDIA_TYPE','Envie JSON.');
  return new Promise((resolve,reject) => {
    let size=0; const chunks: Buffer[]=[]; let overflow=false;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size>16384) { overflow=true; chunks.length=0; reject(new LabError(413,'PAYLOAD_TOO_LARGE','Conteúdo muito grande.')); }
      else if (!overflow) chunks.push(chunk);
    });
    req.on('end', () => { if (overflow) return; try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { reject(new LabError(400,'INVALID_JSON','JSON inválido.')); } });
    req.on('error',reject); req.on('aborted',()=>reject(new LabError(400,'ABORTED','Envio interrompido.')));
  });
}
export function createApp() {
  const store = new BookingStore();
  const server = createServer(async (req,res) => {
    const requestId = randomUUID();
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'");
    res.setHeader('Cache-Control','no-store');
    const send = (status:number, payload:unknown) => { res.writeHead(status,{'content-type':'application/json; charset=utf-8'}); res.end(JSON.stringify(payload)); };
    try {
      const url = new URL(req.url ?? '/', 'http://localhost'); const path = url.pathname;
      if (path === '/health' && req.method === 'GET') { send(200,{status:'ok'}); return; }
      const assets: Record<string,[string,string]> = {'/':['public/index.html','text/html'], '/app.js':['dist/web/app.js','text/javascript'], '/styles.css':['public/styles.css','text/css']};
      if (assets[path] && req.method === 'GET') {
        const [file,type] = assets[path]; const content=await readFile(file);
        res.writeHead(200,{'content-type':`${type}; charset=utf-8`}); res.end(content); return;
      }
      if (!path.startsWith('/api/v1/')) throw new LabError(404,'NOT_FOUND','Página não encontrada.');
      const user = req.headers['x-demo-user'];
      if (user !== 'alice' && user !== 'bob') throw new LabError(401,'UNAUTHENTICATED','Escolha um usuário de demonstração.');
      if (path === '/api/v1/rooms' && req.method === 'GET') { const rooms=loadRooms(); send(200,{data:rooms,pagination:{page:1,perPage:rooms.length,total:rooms.length},meta:{requestId}}); return; }
      if (path === '/api/v1/bookings' && req.method === 'GET') {
        const page=Number(url.searchParams.get('page') ?? 1); const perPage=Number(url.searchParams.get('perPage') ?? 100);
        if (!Number.isInteger(page)||page<1||!Number.isInteger(perPage)||perPage<1||perPage>100) throw new LabError(422,'VALIDATION_ERROR','Paginação inválida.');
        const all=store.list(); send(200,{data:all.slice((page-1)*perPage,page*perPage),pagination:{page,perPage,total:all.length},meta:{requestId}}); return;
      }
      if (path === '/api/v1/bookings' && req.method === 'POST') {
        const booking=store.create(user,await body(req)); send(201,{data:booking,meta:{requestId}}); return;
      }
      const match=/^\/api\/v1\/bookings\/([^/]+)$/.exec(path);
      if (match && req.method === 'DELETE') { store.cancel(user,match[1]!); res.writeHead(204); res.end(); return; }
      throw new LabError(404,'NOT_FOUND','Recurso não encontrado.');
    } catch(error) {
      const known=error instanceof LabError;
      send(known?error.status:500,{error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.detail:'Não foi possível concluir a operação.'},meta:{requestId}});
    }
  });
  server.requestTimeout=10_000; server.headersTimeout=10_000;
  return server;
}
