import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'tests/e2e', fullyParallel:false, workers:1, retries:0,
 reporter:[['list'],['json',{outputFile:'evidence/e2e.json'}]],
 use:{baseURL:'http://127.0.0.1:4318',trace:'retain-on-failure'},
 webServer:{command:'pnpm build && pnpm start',env:{PORT:'4318'},url:'http://127.0.0.1:4318/health',reuseExistingServer:false,timeout:30_000},
});
