# AI Agent Prompt: NPM Project Security & Quality Audit

## Objective

You are an AI software engineer tasked with auditing a Node.js / NPM project. Your goal is to **identify, explain, and help remediate security vulnerabilities, dependency risks, and engineering pitfalls** in the repository.

The audit should prioritize **security, reliability, maintainability, and supply-chain safety**.

---

# Scope of the Audit

Analyze the entire repository including:

* `package.json`
* `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`
* source code (`.js`, `.ts`)
* configuration files
* build scripts
* CI/CD configs
* Dockerfiles (if present)
* environment configuration
* scripts defined in `package.json`

---

# Key Tasks

## 1. Dependency Vulnerability Analysis

Inspect dependencies and identify:

* Known vulnerabilities
* Deprecated packages
* Unmaintained libraries
* Suspicious or potentially malicious packages
* Packages with excessive permissions or install scripts

Steps:

1. Run vulnerability scans equivalent to:

   * `npm audit`
   * `npm audit --production`
2. Inspect dependency tree for:

   * nested vulnerabilities
   * high-risk packages
3. Identify:

   * outdated dependencies
   * packages that should be replaced
4. Suggest safer alternatives when applicable.

Output format:

```
Dependency: <name>
Version: <version>
Issue: <description>
Severity: <low/medium/high/critical>
Recommended Fix: <upgrade or replacement>
```

---

# 2. Supply Chain Risk Review

Check for risks such as:

* install scripts (`postinstall`, `preinstall`)
* packages downloading binaries
* dynamic code execution during install
* packages fetched from non-standard registries
* GitHub dependencies pinned to branches instead of commits
* use of `latest` or loose semver ranges

Flag:

* `*`
* `^`
* unpinned versions

Recommend pinning or lockfile enforcement.

---

# 3. Code Security Review

Inspect application code for common security issues:

### Injection Risks

* command injection
* shell execution
* unsafe eval usage
* template injection

### Web Security

If this is a server:

Check for:

* XSS
* CSRF
* open redirects
* improper input validation
* missing sanitization

### Secrets Handling

Detect:

* API keys
* tokens
* credentials
* private keys
* secrets in code

Recommend moving secrets to environment variables or secret managers.

---

# 4. Configuration & Runtime Risks

Review configuration files for issues such as:

* insecure CORS
* disabled TLS verification
* insecure cookie settings
* unsafe HTTP headers
* debug flags enabled in production

Suggest improvements like:

* `helmet`
* rate limiting
* stricter CORS
* security headers.

---

# 5. Build & Script Safety

Inspect `package.json` scripts:

Look for:

* unsafe shell usage
* command concatenation
* script injection risks
* scripts that fetch remote code

Recommend safer patterns where necessary.

---

# 6. Performance & Maintainability

Identify:

* unnecessary dependencies
* duplicate dependencies
* large dependencies with minimal usage
* poor project structure
* circular dependencies

Suggest simplifications.

---

# 7. Node.js Best Practices

Check for:

* unsupported Node versions
* missing `engines` field
* improper error handling
* synchronous blocking operations
* misuse of async patterns

Recommend modern best practices.

---

# Expected Output

Produce a structured report:

```
# NPM Project Audit Report

## Summary
- Critical issues: X
- High issues: X
- Medium issues: X
- Low issues: X

## Critical Issues
...

## Dependency Vulnerabilities
...

## Supply Chain Risks
...

## Code Security Issues
...

## Configuration Risks
...

## Recommendations
...
```

---

# Remediation Instructions

For each issue:

1. Provide **clear explanation**
2. Provide **exact code fix or command**
3. Prefer **minimal-risk upgrades**

Examples:

```
npm install lodash@latest
```

or

```
Replace package A with package B because ...
```

---

# Constraints

* Do not introduce breaking changes unless explicitly justified.
* Prefer **small safe upgrades** over large migrations.
* Explain reasoning clearly.
* Provide patch-style code examples where possible.

---

# Success Criteria

The audit should help achieve:

* zero known vulnerabilities
* minimal dependency surface
* secure configuration
* improved maintainability
* supply chain safety
