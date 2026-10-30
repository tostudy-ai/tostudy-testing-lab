import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cpus } from 'node:os';
import { assertCurrentEvidence, runTests, type Evidence } from './lib.js';
const root=process.cwd();const out=resolve('evidence/benchmark');mkdirSync(out,{recursive:true});
const results:{baseline:Evidence[];optimized:Evidence[]}={baseline:[],optimized:[]};
// Warm both configurations once; measured runs then alternate order.
for(const mode of ['baseline','optimized'] as const){const r=runTests(root,resolve(out,`warmup-${mode}.json`),mode);assertCurrentEvidence(r.evidence,root);}
for(let round=0;round<3;round++){
 const order=round%2===0?['baseline','optimized'] as const:['optimized','baseline'] as const;
 for(const mode of order){const r=runTests(root,resolve(out,`${mode}-${round+1}.json`),mode);assertCurrentEvidence(r.evidence,root);results[mode].push(r.evidence);console.log(`${mode} ${round+1}: ${r.evidence.durationMs} ms`);}
}
const summarize=(runs:Evidence[])=>{const n=runs.map(r=>r.durationMs).sort((a,b)=>a-b);return {medianMs:n[1]!,minMs:n[0]!,maxMs:n[2]!,passed:runs[0]!.passed};};
const baseline=summarize(results.baseline);const optimized=summarize(results.optimized);
const report={createdAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:cpus()[0]?.model},scope:'Local Vitest process wall time, dependencies installed; one warmup per mode; no browser or CI billing measurement',baseline,optimized,wallTimeReduction:(baseline.medianMs-optimized.medianMs)/baseline.medianMs,agentTokens:null,billedCost:null,runs:results};
writeFileSync(resolve(out,'summary.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({baseline,optimized,report:'evidence/benchmark/summary.json'}));
