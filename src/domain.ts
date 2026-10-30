import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export interface Booking { id: string; userId: string; roomId: string; start: string; end: string }
export interface Room { id: string; name: string; capacity: number }
export class LabError extends Error {
  constructor(public status: number, public code: string, public detail: string) { super(code); }
}
// A runtime resource: test selection based only on static imports is insufficient.
export function loadRooms(): Room[] {
  const filename = resolve(process.cwd(), 'resources', 'rooms.json');
  return JSON.parse(readFileSync(filename, 'utf8')) as Room[];
}
export function overlaps(a: Pick<Booking, 'start' | 'end'>, b: Pick<Booking, 'start' | 'end'>): boolean {
  return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
}
function timestamp(value: unknown): string {
  if (typeof value !== 'string') throw new LabError(422, 'VALIDATION_ERROR', 'Informe data e hora com fuso horário.');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  const time = Date.parse(value);
  if (!match || !Number.isFinite(time)) throw new LabError(422, 'VALIDATION_ERROR', 'Data e hora inválidas.');
  const [,y,m,d,h,min,sec] = match;
  const days = new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate();
  if (Number(m)<1 || Number(m)>12 || Number(d)<1 || Number(d)>days || Number(h)>23 || Number(min)>59 || Number(sec)>59) {
    throw new LabError(422, 'VALIDATION_ERROR', 'Data e hora inválidas.');
  }
  return new Date(time).toISOString();
}
export class BookingStore {
  private bookings: Booking[] = [];
  private rooms = loadRooms();
  create(userId: string, input: unknown): Booking {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new LabError(422, 'VALIDATION_ERROR', 'Reserva inválida.');
    const data = input as Record<string, unknown>;
    if (Object.keys(data).some(key => !['roomId','start','end'].includes(key)) || !this.rooms.some(room => room.id === data.roomId)) {
      throw new LabError(422, 'VALIDATION_ERROR', 'Confira a sala e os campos enviados.');
    }
    const start = timestamp(data.start); const end = timestamp(data.end);
    if (start >= end) throw new LabError(422, 'VALIDATION_ERROR', 'O fim deve ser posterior ao início.');
    const booking: Booking = {id:randomUUID(),userId,roomId:data.roomId as string,start,end};
    if (this.bookings.some(existing => existing.roomId === booking.roomId && overlaps(existing, booking))) {
      throw new LabError(409, 'CONFLICT', 'Esse horário já está reservado.');
    }
    this.bookings.push(booking);
    return { ...booking };
  }
  cancel(userId: string, id: string): void {
    const booking = this.bookings.find(item => item.id === id);
    if (!booking) throw new LabError(404, 'NOT_FOUND', 'Reserva não encontrada.');
    if (booking.userId !== userId) throw new LabError(403, 'FORBIDDEN', 'Você só pode cancelar suas reservas.');
    this.bookings = this.bookings.filter(item => item.id !== id);
  }
  list(): Booking[] { return this.bookings.map(item => ({...item})); }
}
