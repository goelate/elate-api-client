# Security Policy

## Supported Versions

Security updates are provided for the latest released version of `@goelate/elate-api-client`. If a security fix is released, users should upgrade to the newest available version as soon as practical.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.

Use GitHub's private vulnerability reporting or Security Advisories feature for this repository when available. If that is not available, contact the repository maintainers privately via security@goelate.com.

Include as much detail as possible so maintainers can understand and reproduce the issue:

- A description of the vulnerability and its potential impact.
- Affected package version, commit, or release.
- Steps to reproduce or proof-of-concept code, when safe to share privately.
- Any relevant environment details, such as Node.js version or runtime.
- Whether the issue may expose credentials, API keys, customer data, or other sensitive information.

## What to Expect

Maintainers will review private vulnerability reports, assess impact, and coordinate a fix where appropriate. If the report is accepted, maintainers may ask for help validating the fix before public disclosure.

Please allow maintainers time to investigate before disclosing the issue publicly. Public disclosure should be coordinated after a fix or mitigation is available.

## Security Best Practices for Users

- Store Elate API keys in environment variables or a secret manager.
- Do not commit API keys, bearer tokens, generated credentials, or customer data.
- Rotate any credential that may have been exposed in logs, examples, issues, pull requests, or test fixtures.
- Use HTTPS endpoints for API traffic.
- Keep this package and its runtime dependencies up to date.

## Scope

This policy covers vulnerabilities in this TypeScript API client. Vulnerabilities in the Elate service, account configuration, or integrations using this package may require separate coordination with Elate support or the relevant service owner.
