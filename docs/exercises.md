# Guided laboratory

## Exercise 1: make one measured decision

Run the baseline once. Read its report and the inactive workflow example.
Write down one duplicated behavior, one avoidable environment cost and one repeated trigger.
Choose one intervention and name the metric you expect it to affect.
A smaller test count alone does not demonstrate better verification.

## Exercise 2: select by behavior and risk

Change a rule in a disposable copy. Identify its consumers before choosing tests.
Run one file with `pnpm test tests/unit/domain.test.ts`, then compare the scope with `pnpm test:related src/domain.ts`.
Inspect the selected and executed tests. Explain why changing `resources/rooms.json` requires an explicit integration check.
Do not use `--passWithNoTests` to convert an incomplete selection into success.

## Exercise 3: prove detection

Run `pnpm challenge`. Each mutation runs in a temporary copy with linked dependencies.
The runner verifies a clean control, applies one mutation at a time, requires the expected behavioral assertion to fail, and verifies restoration.
The learner's source files are not modified. Reports remain in `evidence/challenges/`.

| Challenge | Mutation | Required observation |
|---|---|---|
| D1 | Disable overlap detection | The named overlap assertion fails |
| D2 | Remove the ownership check | Unauthorized cancellation returns the wrong HTTP status |
| D3 | Rename the creation response field | The consumer contract assertion fails |
| D4 | Change room capacity in runtime JSON | Domain-only tests pass; the catalogue integration assertion fails |
| D5 | Modify source after an approved run | The old report is rejected as `STALE_EVIDENCE` |

A failed installation, timeout or missing runner is not a detected business defect.
The mutation command exits unsuccessfully if the intended assertion does not fail.
D5 models stale results after a newer revision; it does not simulate GitHub scheduling or claim an actual cancelled hosted run.

## Exercise 4: constrain the agent

Adapt `AGENTS.md` to one task. Record its command scope, time allowance and retry budget before work.
Require a hypothesis and new evidence before rerunning a failure.
When the budget is exhausted, report what remains unverified rather than weakening assertions.
Text instructions guide behavior; enforce hard execution limits in the runner or automation layer.

## Exercise 5: compare without losing protection

Run `pnpm benchmark` after `pnpm verify` and `pnpm challenge` pass.
Read the raw reports, sample range and median. Explain the difference in executed test counts.
The core tests are shared by both configurations. The extra baseline cases repeat an existing overlap scenario.
Keep the browser and API checks even if they cost more than pure rule tests.
Review the active CI workflow against the inactive baseline example; identify each changed cost driver.

## Submission rubric

| Criterion | Required artifact |
|---|---|
| Scope | Risk matrix and justified test selection |
| Defect detection | D1–D5 reports and clean restoration |
| Agent control | Commands, budget and a reasoned stop or expansion |
| Working delivery | Current optimized suite and browser results |
| Honest comparison | Raw measurements, environment and explicit limitations |

There is no minimum savings percentage. A slower result can be a valid finding.
Defect detection in these exercises is evidence about these cases, not a claim that all defects are covered.
