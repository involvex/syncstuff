# Security Policy

## Supported Versions

The following versions of SyncStuff are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of SyncStuff seriously. If you believe you have found a security vulnerability in SyncStuff, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

Please send an email to [security@involvex.com](mailto:security@involvex.com) with a detailed description of the vulnerability. We will try to confirm the issue and determine a course of action.

We ask that you:

*   Give us reasonable time to investigate and mitigate the issue before disclosing it publicly.
*   Do not exploit the vulnerability for any reason, including demonstrating it to others or testing the system.
*   Provide enough information for us to reproduce the issue.

### Response Timeline

*   **Acknowledgment:** We will acknowledge receipt of your report within 48 hours.
*   **Assessment:** We will assess the severity and impact of the vulnerability within 5 business days.
*   **Resolution:** We will work to resolve the issue as quickly as possible and will keep you updated on our progress.

## Security Best Practices for Contributors

If you are contributing to SyncStuff, please follow these security best practices:

*   **Secrets Management:** Never commit secrets, API keys, or credentials to the repository. Use environment variables (e.g., `.env` files) and ensure they are added to `.gitignore`.
*   **Dependency Management:** Keep dependencies up to date and regularly check for known vulnerabilities using tools like `npm audit` or `pnpm audit`.
*   **Input Validation:** Validate and sanitize all user input to prevent injection attacks (e.g., SQL injection, XSS).
*   **Authentication & Authorization:** Ensure proper authentication and authorization checks are in place for sensitive operations.
*   **Encryption:** Use strong encryption for sensitive data at rest and in transit.

## Telemetry & Data Privacy

SyncStuff collects minimal telemetry data to improve the application.

*   **Data Collected:** Basic usage statistics, error traces, and performance metrics.
*   **Opt-Out:** Users can opt-out of telemetry collection in the application settings.
*   **Data Storage:** Telemetry data is stored securely in Axiom and is retained for a limited period.
*   **Privacy:** We do not collect personally identifiable information (PII) unless explicitly authorized by the user.

For more information, please refer to our Privacy Policy.
