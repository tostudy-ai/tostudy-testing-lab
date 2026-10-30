import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fingerprint, assertCurrentEvidence, type Evidence } from '../../scripts/lib.js';
const dirs:string[]=[];
function fixture(){const root=mkdtempSync(join(tmpdir(),'evidence-test-'));dirs.push(root);mkdirSync(join(root,'src'));writeFileSync(join(root,'src','rule.ts'),'original');return root;}
afterEach(()=>{for(const root of dirs.splice(0))rmSync(root,{recursive:true,force:true});});
function proof(root:string):Evidence {return {fingerprint:fingerprint(root),node:process.version,platform:process.platform,command:['pnpm','test'],passed:1,failed:0,pending:0,exitCode:0,durationMs:10,createdAt:new Date().toISOString()};}
it('accepts matching successful nonempty evidence',()=>{const root=fixture();expect(()=>assertCurrentEvidence(proof(root),root)).not.toThrow();});
it('rejects stale evidence after a source change',()=>{const root=fixture();const report=proof(root);writeFileSync(join(root,'src','rule.ts'),'changed');expect(()=>assertCurrentEvidence(report,root)).toThrow('STALE_EVIDENCE');});
it('includes runtime resources in the fingerprint',()=>{const root=fixture();const report=proof(root);mkdirSync(join(root,'resources'));writeFileSync(join(root,'resources','rooms.json'),'[]');expect(()=>assertCurrentEvidence(report,root)).toThrow('STALE_EVIDENCE');});
it.each([{passed:0},{exitCode:1},{failed:1},{pending:1},{node:'different'}])('rejects incomplete or incompatible evidence %j',change=>{const root=fixture();expect(()=>assertCurrentEvidence({...proof(root),...change},root)).toThrow();});
