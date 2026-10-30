# Implementation evidence

Original local verification on 2026-10-30. Historical source fingerprint: `2c8dc30975ca2f2ae837d41d6e6c544e2f919e4aaca10a5ed311f309cc1df75a`.
This fingerprint describes the original experiment, not subsequent documentation or workflow revisions.

| Step | Status | Evidence |
|---|---|---|
| Domain and HTTP contracts | Complete | `evidence/red.json`, `evidence/green-core.json`, `evidence/final-tests.json` |
| Browser workflow | Complete | `evidence/e2e-final.json`, desktop and mobile screenshots |
| Baseline, optimized suite and challenges | Complete | `evidence/challenges/summary.json`; D1–D5 detected; restored control passed |
| CI examples and benchmark | Local measurements and hosted workflow tracked separately | `actionlint` passed; `evidence/benchmark/summary.json`; see the workflow run for hosted status |
| Handoff | Complete | README, API contract, exercise guide and measurement protocol |

## Measured comparison

| Mode | Median | Range | Tests |
|---|---:|---:|---:|
| Deliberate baseline | 2272 ms | 1764–3059 ms | 39 |
| Optimized | 1406 ms | 1196–1733 ms | 35 |

Three measured runs per mode, with one warmup each and alternating order.
This measures local Vitest command wall time only. It does not prove billed savings.
The baseline adds four redundant scenarios; both modes execute the same core assertions.
Browser verification remains separate and mandatory for interface changes.

## Red/green evidence

The initial domain/API stubs failed the expected assertions before implementation.
Evidence freshness tests first failed to reject stale or incomplete reports, then passed after implementation.
The browser test first failed to find the reservation page, then passed the full rendered journey.
An initial browser launch failed before installation completed; that infrastructure failure was not counted as red evidence.
The five challenge runs each require behavioral evidence; installation failures do not qualify.

## Limits

The repository is now hosted at https://github.com/parisgroup-ai/tostudy-testing-lab.
The course draft is registered separately in ToStudy; it is not a published course.
The [hosted exercise](hosted-ci.md) defines the required evidence; [PR 1](https://github.com/parisgroup-ai/tostudy-testing-lab/pull/1) tracks the initial two-revision observation. A local YAML check alone does not establish success.
The evidence fingerprint covers tracked and untracked source inputs directly.
The app has no real authentication, persistence, pricing or model integration.
The course lessons include an HTTP-only local artifact switch and rollback exercise; it is not a hosted production deployment.
