import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { inputs, fingerprint, runTests, assertCurrentEvidence } from './lib.js';
const root=process.cwd();const original=fingerprint(root);const output=resolve('evidence/challenges');mkdirSync(output,{recursive:true});
const requested=process.argv[2]??'all';
const ids=['D1','D2','D3','D4','D5'];if(requested!=='all'&&!ids.includes(requested))throw new Error('Use all or D1–D5');
const summary:Record<string,unknown>={};
function mutate(dir:string,file:string,from:string,to:string){const path=join(dir,file);const source=readFileSync(path,'utf8');if(source.split(from).length!==2)throw new Error(`Mutation anchor missing or ambiguous: ${file}`);writeFileSync(path,source.replace(from,to));}
const temp=mkdtempSync(join(tmpdir(),'tostudy-challenges-'));
try {
 for(const input of inputs)if(existsSync(join(root,input)))cpSync(join(root,input),join(temp,input),{recursive:true});
 symlinkSync(join(root,'node_modules'),join(temp,'node_modules'),'dir');
 const clean=runTests(temp,join(output,'clean.json'));assertCurrentEvidence(clean.evidence,temp);
 for(const id of ids.filter(id=>requested==='all'||requested===id)){
  // Restore production sources and runtime data before each independent mutation.
  for(const dir of ['src','resources','public'])cpSync(join(root,dir),join(temp,dir),{recursive:true});
  if(id==='D5'){
   const old=clean.evidence;
   mutate(temp,'src/domain.ts','return this.bookings.map','/* newer revision */ return this.bookings.map');
   let rejected=false;try{assertCurrentEvidence(old,temp);}catch(error){rejected=error instanceof Error&&error.message==='STALE_EVIDENCE';}
   if(!rejected)throw new Error('D5 failed to reject stale evidence');
   summary[id]={detected:true,reason:'STALE_EVIDENCE',old:old.fingerprint,current:fingerprint(temp)};
  } else {
   let filter='tests/integration/api.test.ts';let expected='';
   if(id==='D1'){mutate(temp,'src/domain.ts','return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);','return false;');filter='tests/unit/domain.test.ts';expected='rejects overlapping reservations';}
   if(id==='D2'){mutate(temp,'src/domain.ts','if (booking.userId !== userId)','if (false)');expected='returns 403 and preserves';}
   if(id==='D3'){mutate(temp,'src/app.ts','send(201,{data:booking,meta:{requestId}})','send(201,{reservation:booking,meta:{requestId}})');expected='creates and lists the documented contract';}
   if(id==='D4'){
    mutate(temp,'resources/rooms.json','"capacity":6','"capacity":600');expected='loads the runtime room catalogue';
    const blind=runTests(temp,join(output,'D4-incomplete-selection.json'),'optimized','tests/unit/domain.test.ts');assertCurrentEvidence(blind.evidence,temp);
   }
   const result=runTests(temp,join(output,`${id}.json`),'optimized',filter);
   const failures=result.report.testResults.flatMap(s=>s.assertionResults).filter(t=>t.status==='failed');
   const detected=failures.some(t=>t.fullName.includes(expected)&&t.failureMessages.some(message=>message.includes('AssertionError')));
   if(result.evidence.exitCode===0||!detected)throw new Error(`${id}: expected behavior assertion did not fail; infrastructure failures do not count`);
   summary[id]={detected,expectedAssertion:expected,evidence:result.evidence};
  }
  console.log(`${id}: defect detected`);
 }
 for(const dir of ['src','resources','public'])cpSync(join(root,dir),join(temp,dir),{recursive:true});
 const restored=runTests(temp,join(output,'restored.json'));assertCurrentEvidence(restored.evidence,temp);
 if(fingerprint(root)!==original)throw new Error('Working files changed during challenges');
 writeFileSync(join(output,'summary.json'),JSON.stringify({sourceFingerprint:original,createdAt:new Date().toISOString(),challenges:summary,restored:restored.evidence},null,2));
 console.log('Restored copy passed. Working files unchanged. Reports: evidence/challenges/');
}finally{rmSync(temp,{recursive:true,force:true});}
