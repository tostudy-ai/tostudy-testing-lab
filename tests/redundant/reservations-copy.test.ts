// Deliberate duplication for the baseline exercise. The optimized suite excludes this file.
import { expect, it } from 'vitest';
import { BookingStore } from '../../src/domain.js';
for (const label of ['UI layer copy', 'service layer copy', 'helper layer copy', 'generated copy']) {
 it(`${label}: rejects the same overlap`,()=>{
  const store=new BookingStore(); const slot={roomId:'cedar',start:'2030-05-20T10:00:00Z',end:'2030-05-20T11:00:00Z'};
  store.create('alice',slot); expect(()=>store.create('bob',slot)).toThrow('CONFLICT');
 });
}
