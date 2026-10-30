# Effective tests, controlled costs

A runnable TypeScript teaching lab for the ToStudy.AI course **Desenvolvimento com IA: testes eficazes, custos sob controle**.
The same reservation application supports a deliberately wasteful baseline and an optimized test configuration.
The application has a real HTTP API, an in-memory store and a Portuguese browser interface.

## Start locally

Use Node 22.23.1 and pnpm 10.34.7. Dependencies are pinned in `pnpm-lock.yaml`.
Clone the repository, or download its source archive and extract it into a new folder. Run commands from that folder.
The lab uses public npm packages only; no ToStudy API key or Paris Group development tooling is needed.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm start
```

For lesson 1.3, copy the historical reference reports once, without running another benchmark:

```sh
mkdir -p evidence/benchmark
cp -n examples/reference-evidence/benchmark/*.json evidence/benchmark/
```

These commands target bash/zsh. On Windows, use WSL; native Windows execution has not been validated.
The reference reports are measurements from the original macOS run, not proof of your current checkout.
Absolute paths were made repository-relative; timestamps, counts and timings are unchanged. See `examples/reference-evidence/benchmark/provenance.json`.
Do not overwrite evidence from your own experiments with the reference reports.

Open http://127.0.0.1:4317. Choose a demo user, room and time, then select **Reservar sala**.
Choose Bruno and try to cancel Alice's reservation to observe the permission rule.
Switch back to Alice to cancel successfully. Stop the server with Ctrl+C.

This is a loopback-only teaching app. The demo header is intentionally selectable, not production authentication.
Data lives in memory and resets when the process stops. Do not expose the server publicly.
The app itself calls no model or paid service. Learner coding agents and hosted CI may consume their own account quotas.

## Commands

| Command | Purpose |
|---|---|
| `pnpm test` | Optimized unit and real HTTP integration tests; no browser emulation |
| `pnpm test:baseline` | The same core tests plus deliberate duplicates, using jsdom |
| `pnpm verify` | Type checking, optimized tests, build and browser journey |
| `pnpm challenge` | D1–D5 in temporary copies, with clean and restored control runs |
| `pnpm benchmark` | Paired local timing experiment; writes raw JSON and a summary |

For a targeted change, run `pnpm test tests/unit/domain.test.ts`.
For a dependency-based selection, run `pnpm test:related src/domain.ts` and inspect the executed test count.
A zero-test selection is not proof. Global config, permissions, API contracts and runtime resources may need broader verification.
Run `pnpm challenge D4` to see a runtime catalogue change escape a domain-only selection and fail integration tests.
Use `pnpm e2e:run` for the browser journey; it builds the app and owns an isolated server on port 4318.
`pnpm dev` watches the API; run `pnpm build` after client changes so the served browser bundle is current.

## How the course uses this repository

| Module | Starting point | Evidence |
|---|---|---|
| Diagnose waste | Baseline config and disabled workflow example | Execution record and a concrete hypothesis |
| Select by risk | Domain, HTTP contract and runtime rooms catalogue | Selection rationale and an example requiring expansion |
| Review generated tests | Redundant tests and controlled mutations | Expected assertion fails on a defect, then passes after restoration |
| Guide the agent | `AGENTS.md` and evidence validation | Reasoned commands, stopping conditions and current evidence |
| Optimize CI/CD | Optimized workflow and benchmark | Raw measurements, preserved checks and scoped conclusions |

See [exercises](docs/exercises.md), [API contract](docs/api.md), [measurement protocol](docs/measurement.md) and [implementation evidence](docs/implementation.md).
The complete course lessons and platform registration are separate deliverables.
See [hosted CI exercise](docs/hosted-ci.md) for the repository setup and the two-revision cancellation observation.

## Repository map

| Path | Responsibility |
|---|---|
| `src/`, `public/`, `resources/` | Domain rules, HTTP server, browser UI and runtime catalogue |
| `tests/unit/`, `tests/integration/`, `tests/e2e/` | Rule, API and real-browser verification |
| `tests/redundant/`, `vitest.baseline.config.ts` | Deliberate teaching waste; excluded from optimized tests |
| `scripts/` | Source fingerprinting, isolated challenges and measured comparison |
| `.github/`, `examples/`, `docs/` | Optimized CI, inactive baseline example and learning material |

## Verification limits

Inspect the [hosted workflow runs](https://github.com/parisgroup-ai/tostudy-testing-lab/actions/workflows/ci.yml) and match the result to the revision being studied.
A run is evidence only after the required job completes successfully; queued, running or cancelled runs are not approval.
The cancellation exercise is documented in [PR 1](https://github.com/parisgroup-ai/tostudy-testing-lab/pull/1). No production deployment is part of this laboratory.
Source fingerprints detect stale evidence, including local changes and runtime files; they are not signed provenance or a security attestation.
A matching report only covers its recorded command and test scope. It cannot replace browser, integration or release checks it did not run.
The benchmark measures local Vitest command wall time. It does not measure CI invoices, model tokens or production defect rates.
