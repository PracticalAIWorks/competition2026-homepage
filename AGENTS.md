# Repository Guidelines

## Project Structure & Module Organization

Keep the top level reserved for project-wide configuration and documentation. The current static portal uses this layout:

- `src/site/` — production HTML, CSS, and JavaScript for the static portal.
- `src/assets/` — static, non-secret site assets.
- `scripts/` — repeatable build and validation tasks.
- `deploy/` — Docker Compose, Nginx, certificate placeholders, and deployment environment template.
- `dist/` — generated distributables; never edit these files directly.
- `docs/` and `reference/` — project documentation and unversioned source material, respectively.
- `artifacts/` and `archive/` — local visual-check outputs and preserved legacy material; not deployment inputs.
- `tests/` — future automated tests that mirror the relevant `src/` paths.

Avoid placing generated files, local caches, credentials, or large datasets in version control. Document any new top-level directory in `README.md`.

## Build, Test, and Development Commands

No build system or package manifest has been added yet. When introducing one, expose the common workflow through documented, reproducible commands—for example:

```sh
# Install dependencies
npm install
# Run the local development server
npm run dev
# Run checks and the test suite
npm test
```

Use the project’s package/task runner rather than undocumented one-off commands. Add each required command, its purpose, and prerequisites to `README.md` when it is introduced.

## Coding Style & Naming Conventions

Follow the formatter and linter selected for the project; do not hand-format code against their output. Use 2 spaces for JSON, YAML, and JavaScript/TypeScript unless the adopted formatter specifies otherwise. Prefer descriptive names: `score_submission()` over `score()`, `competition_id` over `id` when context is ambiguous.

Use `kebab-case` for directories and non-code asset names, and follow the primary language’s conventional casing for source files, types, functions, and constants. Keep modules focused and avoid unrelated refactors in feature changes.

## Testing Guidelines

Add tests with each behavior change. Name test files after the unit or feature they cover (for example, `tests/scoring/leaderboard.test.ts`) and write test names around observable outcomes. Cover success paths, validation failures, and boundary cases. Run the full relevant suite before opening a pull request; record any intentionally unrun checks in the PR description.

## Commit & Pull Request Guidelines

There is no commit history yet, so use concise imperative commits such as `feat: add leaderboard scoring` or `fix: reject duplicate submissions`. Keep commits scoped and reviewable. Pull requests should explain the user-facing change, testing performed, linked issue (if applicable), and any configuration or migration impact. Include screenshots for visual changes and never include secrets in code, logs, fixtures, or review text.
