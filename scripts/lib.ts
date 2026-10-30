import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
export interface Evidence {fingerprint:string;node:string;platform:string;command:string[];passed:number;failed:number;pending:number;exitCode:number;durationMs:number;createdAt:string}
export const inputs=['src','tests','scripts','resources','public','.github','package.json','pnpm-lock.yaml','tsconfig.json','tsconfig.build.json','vitest.config.ts','vitest.baseline.config.ts','playwright.config.ts'];
export function fingerprint(root=process.cwd()):string {
 const files:string[]=[];
 function visit(path:string):void {for(const entry of readdirSync(path,{withFileTypes:true})){const p=join(path,entry.name);if(entry.isDirectory())visit(p);else if(entry.isFile())files.push(p);}}
 for(const name of inputs){const path=join(root,name);if(!existsSync(path))continue;if(name.includes('.')&&!['.github'].includes(name))files.push(path);else visit(path);}
 const hash=createHash('sha256');
 for(const file of files.sort()){hash.update(relative(root,file));hash.update('\0');hash.update(readFileSync(file));hash.update('\0');}
 return hash.digest('hex');
}
export function assertCurrentEvidence(report:Evidence,root=process.cwd()):void {
 if(report.fingerprint!==fingerprint(root))throw new Error('STALE_EVIDENCE');
 if(report.node!==process.version||report.platform!==process.platform)throw new Error('ENVIRONMENT_MISMATCH');
 if(report.exitCode!==0||report.passed<=0||report.failed!==0||report.pending!==0)throw new Error('INCOMPLETE_EVIDENCE');
}
export interface TestReport {numPassedTests:number;numFailedTests:number;numPendingTests:number;testResults:{name:string;assertionResults:{fullName:string;status:string;failureMessages:string[]}[]}[]}
export function runTests(root:string,output:string,mode:'baseline'|'optimized'='optimized',filter?:string) {
 mkdirSync(dirname(output),{recursive:true});
 const args=[mode==='baseline'?'test:baseline':'test',...(filter?[filter]:[]),'--reporter=json',`--outputFile=${output}`];
 rmSync(output,{force:true});
 const started=performance.now();const before=fingerprint(root);
 const result=spawnSync('pnpm',args,{cwd:root,encoding:'utf8',timeout:60_000,maxBuffer:2_000_000});
 if(result.error||result.signal||!existsSync(output))throw new Error(`Runner did not produce evidence: ${result.error?.message ?? result.stderr}`);
 const report=JSON.parse(readFileSync(output,'utf8')) as TestReport;
 const evidence:Evidence={fingerprint:before,node:process.version,platform:process.platform,command:['pnpm',...args],passed:report.numPassedTests,failed:report.numFailedTests,pending:report.numPendingTests,exitCode:result.status??1,durationMs:Math.round(performance.now()-started),createdAt:new Date().toISOString()};
 if(before!==fingerprint(root))throw new Error('SOURCE_CHANGED_DURING_RUN');
 return {report,evidence};
}
