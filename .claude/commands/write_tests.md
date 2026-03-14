## Objective

You are an AI software engineer tasked with **writing high-quality automated tests** for $ARGUMENTS.

Do the work now — do not request followups. If information is missing, make reasonable assumptions and proceed; document those assumptions in the report.

---

## Required Deliverables (produce in one run)

1. New or modified test files placed next to the source following the repo convention.
2. Any minimal, justified source fixes required to make tests pass and be correct.
3. A single Markdown report (see **Report Template** section) summarizing actions, diffs, commands run, and coverage results.

---

## Workflow — Steps the agent must execute

### 1. Locate the function

* Search the repository for the required functions or files for which tests are needed

* Determine:

  * file path containing the function
  * whether function is exported and how (named/default/module.exports)
  * function signature (parameters, return type if TypeScript)
  * important helper functions or external dependencies (network, fs, DB)

Document the file path and any assumptions about behavior in the report.

---

### 2. Analyze behavior

* Read surrounding code and tests (if any).
* Derive:

  * inputs and valid/invalid input shapes
  * outputs and side effects
  * error conditions and exceptions
  * interactions with external systems (HTTP, filesystem, DB, timers, randomness)

List these assumptions in the report. If a dependency is noisy (network/filesystem), plan to mock it.

---

### 3. Create test scaffold

* Create a test file next to the source following project conventions. Prefer:

  * `path/to/__tests__/<function>.test.ts` or
  * `path/to/<function>.test.ts`
* Use the repo's existing test framework. If none configured, default to **Jest** + **ts-jest** for TypeScript or **Jest** + **babel-jest** for JS.
* Add any necessary minimal test dependencies to `devDependencies` (e.g., `@testing-library/dom`, `nock`, `msw`, `axios-mock-adapter`, `jest-mock`, `sinon`, `@testing-library/react` — only if required). Document added deps.

---

### 4. Write high-quality tests

For the target function, cover:

**Core behavior**

* Happy path(s): expected correct inputs → expected outputs.
* Return types and value shapes.

**Edge cases**

* Empty inputs, `null`/`undefined`, boundary values, large inputs.

**Error handling**

* Inputs that should throw or reject — assert error messages/types.

**Side effects**

* Mock and assert interactions with external systems (HTTP, filesystem, DB).

**Determinism**

* Mock:

  * network calls (e.g., with `nock` or `msw`)
  * filesystem (`memfs` or jest `fs` mocks) if needed
  * timers (`jest.useFakeTimers()`), `Date.now`, random seeds
* Avoid snapshot-only tests. Use user-facing queries/outputs for assertions.

**Test quality**

* Clear test names and Arrange / Act / Assert structure.
* Use `getByRole`, `getByText`, or equivalent for UI tests (if relevant).
* Keep tests fast and isolated.

---

### 5. Run tests with coverage

* Detect package manager from lockfile: `package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm.
* Install deps:

  * `npm ci || npm install`
  * or `yarn install`
  * or `pnpm install`
* Run typecheck if TypeScript: `npx tsc --noEmit` (or project-specific)
* Run tests with coverage:

  * npm: `npm test -- --coverage` or `npm run test -- --coverage`
  * yarn: `yarn test --coverage`
  * pnpm: `pnpm test -- --coverage`
  * vitest: `npx vitest run --coverage`
* Capture test output and coverage summary.

---

### 6. Fix failures and iterate

* If tests fail:

  * If the test is incorrect, correct the test.
  * If source code contains a real bug, apply a **minimal non-breaking fix**, add a test guarding it, and document the rationale.
* Run `eslint`/`tsc` only to the extent required to get tests passing. Fix errors that block test execution or indicate real bugs.
* Avoid large refactors. If the function is hard to test due to design, perform minimal extraction (pure helper) and document the reason.

---

### 7. Coverage target

* Aim to maximize coverage for the target function:

  * Recommended targets (for that file): Lines ≥ 90%, Branches ≥ 85%, Functions ≥ 90%.
* If repository-wide thresholds exist, respect them; otherwise document target achieved for the function file and global coverage.
* If some branches cannot reasonably be tested (external system internals, third-party network logic), explain and, only if absolutely necessary, mark with `/* istanbul ignore next */` with justification.

---

### 8. CI integration (optional)

* If repository has CI (GitHub Actions / GitLab), suggest a small addition to run tests with coverage and fail on insufficient coverage. Provide a CI snippet in the report — do **not** modify CI files automatically unless requested.

---

## Commands the agent should run (examples to include in report)

```bash
# install
npm ci || npm install
# type check (if ts)
npx tsc --noEmit
# linter (if present and blocking)
npx eslint . --ext .js,.ts,.tsx
# run tests with coverage
npm test -- --coverage
# or for vitest
npx vitest run --coverage
```

Include the *trimmed* stdout/stderr from these commands in the report (focus on failing traces and the coverage summary).

---

## Report Template (single Markdown output)

Produce a single Markdown report that fills these sections exactly and includes diffs/patches inline for any code changes.

````markdown
# Test Implementation Report — Function: <FUNCTION_NAME>

## Summary
- File located: `<path/to/file>`
- Export type: `named` / `default` / `module.exports`
- Test file(s) added: `<path/to/testfile.test.(ts|js)>`
- Test framework detected/used: `<jest|vitest|mocha|...>`
- Package manager: `<npm|yarn|pnpm>`
- Coverage focus: target function file
- Final status: PASS / FAIL (tests run and coverage results)

## Assumptions
- <List any behavioral assumptions made about the function>

## Commands executed (trimmed)
- `npm ci` — success / failure (brief)
- `npx tsc --noEmit` — success / failure (brief)
- `npm test -- --coverage` — show key failing traces (if any) and final coverage summary

## Files added / modified
- `+ <path/to/testfile.test.ts>` — tests added (describe what each test covers)
- `~ <path/to/sourcefile>` — small fix (one-line rationale) — include patch:
```diff
<include unified diff or minimal patch here>
````

## Tests implemented (brief list)

* `should return X when given Y`
* `should throw Z when input invalid`
* `mocks network call and returns expected value`
* `edge case: null/undefined inputs`

## Coverage results (trimmed)

* Target file `<path/to/sourcefile>`:

  * Lines: XX% (covered N / total M)
  * Branches: XX%
  * Functions: XX%
* Global coverage (if run): Lines: XX% | Branches: XX% | Functions: XX%

## Fixes applied

1. **Issue:** Short description of bug discovered.
   **Fix:** One-line explanation.
   **Patch:**

```diff
<diff>
```

## Outstanding issues & recommendations

* <If any paths cannot be tested or need architectural changes, list them and suggested next steps.>
* If secret leakage or other security issues were observed, list them as findings (do not print secret values).

## Suggested commit messages / PR title

* `test(<function>): add unit tests for <FUNCTION_NAME>`
* `fix(<function>): <short fix summary>`

## Example test run output (coverage summary)

```
----------|----------|----------|----------|----------|----------------|
File      | % Stmts  | % Branch | % Funcs  | % Lines  | Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
.../src/.../<file>.ts |  92.31 |  85.71  | 100.00 |  92.31 | 12-14, 56 |
----------|----------|----------|----------|----------|----------------|
```

```

---

## Constraints & Policies (must follow)
- **Do not** print or commit secrets. If secrets are found, include them in the report as a finding and instruct to remove them to a secret manager.
- Make minimal, well-documented source changes only; prefer tests that drive fixes.
- Tests must be deterministic and fast.
- Avoid large refactors and breaking API changes. If a breaking change is absolutely necessary, document the risk and justification.

---
