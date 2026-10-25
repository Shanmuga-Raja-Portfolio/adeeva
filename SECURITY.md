# Security Policy

## Scope

Maker Studio is an offline-first PWA: it runs in the browser, installs a
service worker, and stores progress on the device. There is no server, no
account system, no analytics, and no data collection by the project itself.

The realistic risks here are:

- A committed secret (API key, token) — ours or a contributor's.
- A dependency with a known advisory (audited in CI on every push and PR,
  including a secrets scan with gitleaks).
- A change to the service worker, precache list or headers that weakens the
  offline/privacy guarantees.
- Third-party code fetched at build or runtime.

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

Use GitHub's private reporting: this repository's **Security tab →
"Report a vulnerability"**. Include the affected file or flow, what you
expected, and what happened. Please leave real keys and tokens out of the
report. We aim to reply within a week, and ask for a fair chance to fix an
issue before details are shared publicly.

If the issue is in a dependency (React, Vite, Playwright, and so on), please
also report it upstream so everyone benefits.

## Supported versions

Only the latest release tag and `main` receive fixes. The hosted app is
redeployed from release tags; pull the latest tag and you are current.

## What we commit to

- Secrets committed to this repo are treated as compromised: revoked first,
  investigated second.
- Shipped code must carry no known dependency advisory at any level, and the
  CI secrets scan runs on full history.
- Everything is MIT-licensed source, auditable line by line.
