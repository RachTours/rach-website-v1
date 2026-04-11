# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.2.x   | :white_check_mark: |
| < 3.2   | :x:                |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please do **NOT** open an issue.

Instead, please report it exclusively by emailing **security@rach-tours.com**.

## Security Measures

This project implements the following security measures:
- **Helmet**: Secure HTTP headers.
- **Rate Limiting**: Protection against brute-force and DDoS.
- **JWT Authentication**: Secure admin access.
- **Input Sanitization**: Prevention of XSS and SQL Injection.
- **Cookie Security**: HttpOnly and Secure flags for auth tokens.
