# Hosted CI exercise

Use a separate exercise repository under your control. Do not use a production repository.
The source laboratory does not deploy an application or need any secret.
GitHub Actions uses the exercise repository owner's quota and billing settings.

## Prepare your copy

Download the source archive or clone the lab. Create an empty private GitHub repository in your account, then push the source to its `main` branch.
If you downloaded an archive, initialize Git locally before adding the remote and committing.
Keep `.github/workflows/ci.yml`, `.node-version`, `package.json` and `pnpm-lock.yaml` together.
Enable Actions in your repository if it is disabled. The workflow needs only `contents: read`.

The `lab-ci` workflow installs the pinned dependencies, checks types, runs unit/integration tests and then the Chromium journey.
It uploads reports even when a preceding step fails. An available artifact does not mean that the checks passed.

## Observe two revisions

Create a documentation branch and open a draft pull request against `main`.
Wait until the first `lab-ci` run for that PR is **In progress**.
Push another small documentation commit to the same branch while the first run is still active.
Record the two run URLs, event, PR reference, head SHA, status and conclusion.

The older PR run should be cancelled by the concurrency policy. The current revision still needs its own successful checks.
A completed older run cannot demonstrate cancellation; two manual dispatches cannot demonstrate the PR-only policy either.
Allow at most one planned retry if the first run completes too soon, then report an inconclusive observation instead of repeating indefinitely.
Do not manually cancel a run to manufacture this evidence.

## Inspect dependency reuse

Read the setup-node cache restore/save log. Record a hit, partial hit or miss as observed.
The dependency cache does not contain a test verdict for your new source revision.
Compare the active workflow with `examples/ci-baseline.yml.txt`: the disabled example repeats a test command and triggers both branch pushes and PRs.

## Evidence to keep

Keep the old and current run URLs and SHAs, the relevant job steps, cache messages and downloaded `lab-evidence-*` artifacts.
Artifacts expire after seven days in this workflow, so download them during the exercise.
Do not treat a skipped, cancelled, pending or absent required check as a successful check.
Leave the exercise PR open for review or close it when the observation is complete; no merge is required to learn this behavior.
