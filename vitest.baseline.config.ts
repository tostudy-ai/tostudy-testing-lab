import { defineConfig } from 'vitest/config';
// Deliberate waste: DOM emulation for server logic, plus duplicated scenarios.
export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts', 'tests/redundant/**/*.test.ts'], environment: 'jsdom', maxWorkers: 2, retry: 0, passWithNoTests: false } });
