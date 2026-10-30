# Measurement protocol

`pnpm benchmark` runs one warmup per mode, then three measured runs per mode, alternating order.
Both modes use the same application, dependency installation, Node version and worker limit.
The baseline adds redundant assertions and jsdom; the optimized configuration uses Node for server logic.
The experiment measures the combined effect of these two interventions. Isolate them in separate experiments to attribute individual gains.

Each sample records the source fingerprint, command, runtime, duration, executed tests and result.
The summary records median, minimum and maximum. Failed, empty or pending samples are rejected.
The output is `evidence/benchmark/summary.json`; raw Vitest JSON files are next to it.

These are warmed local test-process measurements, including pnpm and runner startup.
OS filesystem caches are not forcibly reset. Do not call this a controlled cold-cache experiment.
This excludes browser installation, E2E, workflow queue time, dependency download and GitHub billing.
No coding-agent session is measured: token consumption and billed cost are `null`, not zero.

For hosted CI, separately collect queue duration, elapsed job time, sum of job durations and billed usage.
For an agent, record provider/model/configuration, input, output and cached tokens when available.
Apply the tariff in force on the run date only to categories that are actually metered.
An account subscription may not support assigning a marginal currency cost to one run.

## Reference documentation

- [Vitest CLI and selection](https://vitest.dev/guide/cli.html)
- [Playwright retries and flaky results](https://playwright.dev/docs/test-retries)
- [Playwright server lifecycle](https://playwright.dev/docs/test-webserver)
- [GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub dependency cache](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)

Dependencies and Action revisions were resolved on 2026-10-30 and pinned.
Before adopting new versions, rerun the lab and review the corresponding official release notes.
