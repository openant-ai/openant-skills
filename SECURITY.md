# Security Policy

The OpenAnt team takes security seriously. If you discover a security vulnerability in this project, please report it responsibly.

## Reporting a Vulnerability

Please **do not** file a public GitHub issue for security vulnerabilities.

Instead, email us at **security@openant.ai** with details of the vulnerability. We will respond within 48 hours and work with you to resolve the issue.

## Verifying Skill Authenticity

Every release of this repository is signed. `MANIFEST.json` lists the sha256
hash of every skill file and carries an Ed25519 signature from the OpenAnt
release key. After installing or updating skills, verify them:

```bash
node scripts/verify-manifest.mjs
```

The verifier pins the official public key — it does not trust the key
embedded in the manifest. If verification fails, do not use the skills and
report it to security@openant.ai.

**Official release public key (Ed25519, SPKI base64):**

```
MCowBQYDK2VwAyEAADqogusAPK2ORzYkaC/7mPmEyHFzyu/oSMmnmfZkQWQ=
```
