# TaskFlow — Security Evaluation Ground Truth Registry
## GHAS vs Snyk — SAST + DAST + SCA Coverage Benchmark

All vulnerabilities below are **intentional**. Do not remediate until
evaluation scoring is complete.

---

## SAST Vulnerabilities (Code-Level, Static Analysis)

| ID | File | CWE | OWASP | Type | Description |
|----|------|-----|-------|------|-------------|
| SAST-01 | `routes/vuln.js` | CWE-95 | A03 | Code Injection | `eval()` on raw `req.query.expr` |
| SAST-02 | `routes/vuln.js` | CWE-78 | A03 | OS Command Injection | `exec()` with unsanitized `req.query.host` |
| SAST-03 | `routes/vuln.js` | CWE-22 | A01 | Path Traversal | `path.join(__dirname, req.query.name)` no sanitization |
| SAST-04 | `routes/vuln.js` | CWE-918 | A10 | SSRF | `axios.get(req.query.url)` — no URL allowlist |
| SAST-05 | `routes/vuln.js` | CWE-89 | A03 | SQL Injection | String-concatenated raw `db.query()` |
| SAST-06 | `routes/vuln.js` | CWE-79 | A03 | Reflected XSS | `res.send('<h1>Hello ' + name)` — HTML response |
| SAST-07 | `routes/vuln.js` | CWE-611 | A05 | XXE | `xml2js.parseString` on user-supplied XML |
| SAST-08 | `routes/vuln.js` | CWE-502 | A08 | Insecure Deserialization | `JSON.parse(req.body.payload)` no schema validation |
| SAST-09 | `routes/vuln.js` | CWE-601 | A01 | Open Redirect | `res.redirect(req.query.to)` — no allowlist |
| SAST-10 | `routes/vuln.js` | CWE-200 | A02 | Sensitive Data Exposure | `SELECT *` returns `passwordHash` in response |
| SAST-11 | `routes/vuln.js` | CWE-1321 | A08 | Prototype Pollution | Unsafe deep merge with `__proto__` key |
| SAST-12 | `routes/auth.js` | CWE-312 | A02 | Credential Logging | Raw password written to `console.log` |
| SAST-13 | `routes/auth.js` | CWE-327 | A02 | Weak JWT Algorithm | Caller-controlled `alg` param passed to `jwt.sign()` |
| SAST-14 | `routes/auth.js` | CWE-204 | A07 | Username Enumeration | Different error messages for unknown user vs wrong password |
| SAST-15 | `routes/auth.js` | CWE-307 | A07 | No Rate Limiting | No throttle on `POST /auth/login` — brute-force possible |
| SAST-16 | `middleware/auth.js` | CWE-284 | A01 | Auth Bypass | RBAC skipped when `NODE_ENV=development` |
| SAST-17 | `middleware/auth.js` | CWE-327 | A02 | JWT Alg Confusion | `jwt.verify()` without `algorithms` option — accepts `alg:none` |
| SAST-18 | `index.js` | CWE-693 | A05 | Security Misconfiguration | `helmet` with CSP, frameguard, and HSTS explicitly disabled |
| SAST-19 | `index.js` | CWE-942 | A05 | Permissive CORS | `origin: '*'` with `credentials: true` |
| SAST-20 | `index.js` | CWE-209 | A05 | Stack Trace Leak | `err.stack` included in 500 JSON response |
| SAST-21 | `index.js` | CWE-200 | A05 | Version Fingerprinting | `X-Powered-By: Express` header not suppressed |
| SAST-22 | `client/AuthContext.jsx` | CWE-922 | A02 | Insecure Token Storage | JWT in `localStorage` — XSS-accessible |
| SAST-23 | `client/AuthContext.jsx` | CWE-345 | A02 | Unverified JWT Decode | `atob()` decode with no signature verification |
| SAST-24 | `routes/admin.js` | CWE-639 | A01 | BOLA / IDOR | Any auth user can read/delete any user by ID |
| SAST-25 | `routes/admin.js` | CWE-915 | A08 | Mass Assignment | All request body fields passed directly into SQL UPDATE |

---

## DAST Vulnerabilities (Runtime, Exploitable via HTTP)

| ID | Method | Endpoint | Payload | Expected Exploit |
|----|--------|----------|---------|-----------------|
| DAST-01 | GET | `/api/vuln/eval` | `?expr=require('child_process').execSync('id').toString()` | RCE — returns OS user |
| DAST-02 | GET | `/api/vuln/cmd` | `?host=127.0.0.1;cat /etc/passwd` | Command injection — returns passwd file |
| DAST-03 | GET | `/api/vuln/file` | `?name=../../etc/passwd` | Path traversal — returns file contents |
| DAST-04 | GET | `/api/vuln/fetch` | `?url=http://169.254.169.254/latest/meta-data/` | SSRF — hits cloud metadata endpoint |
| DAST-05 | GET | `/api/vuln/users` | `?role=' OR '1'='1'--` | SQL injection — returns all users |
| DAST-06 | GET | `/api/vuln/greet` | `?name=<script>alert(document.cookie)</script>` | Reflected XSS — script executes in browser |
| DAST-07 | POST | `/api/vuln/xml` | XXE entity payload in `xml` field | XXE — reads server-side files |
| DAST-08 | POST | `/api/vuln/deserialize` | `{"payload":"{\"__proto__\":{\"admin\":true}}"}` | Prototype pollution |
| DAST-09 | GET | `/api/vuln/redirect` | `?to=https://evil.example.com` | Open redirect — phishing vector |
| DAST-10 | GET | `/api/vuln/profile` | `?id=<any valid UUID>` | IDOR — full user record including passwordHash |
| DAST-11 | POST | `/api/vuln/merge` | `{"__proto__":{"polluted":true}}` | Prototype pollution — `({}).polluted === true` |
| DAST-12 | POST | `/api/auth/login` | Repeated requests — no lockout | Brute-force — no rate limit |
| DAST-13 | POST | `/api/auth/login` | `?alg=none` + forged unsigned JWT | JWT alg:none — auth bypass |
| DAST-14 | GET | `/api/admin/users/:id` | Any UUID with valid (non-admin) JWT | BOLA — horizontal privilege escalation |
| DAST-15 | PUT | `/api/admin/users/:id` | `{"role":"admin"}` with employee JWT | Mass assignment — self-promote to admin |
| DAST-16 | ANY | Any endpoint | Inspect response headers | Missing CSP, HSTS, X-Frame-Options |
| DAST-17 | GET | `/api/vuln/eval` (POST 500) | Trigger runtime error | Stack trace in response body |

---

## SCA Vulnerabilities (Dependency-Level)

| ID | Package | Version | CVE(s) | Severity | Workspace |
|----|---------|---------|--------|----------|-----------|
| SCA-01 | `axios` | `0.21.1` | CVE-2021-3749 | High | api + client |
| SCA-02 | `jsonwebtoken` | `8.5.1` | CVE-2022-23529, CVE-2022-23539 | High | api |
| SCA-03 | `sequelize` | `6.6.2` | CVE-2023-22578 | High | api |
| SCA-04 | `xml2js` | `0.4.19` | CVE-2023-0842 | Medium | api |
| SCA-05 | `vite` | `2.9.9` | CVE-2024-23331 | High | client |
| SCA-06 | `react` | `17.0.2` | EOL — no patches | Medium | client |
| SCA-07 | `react-router-dom` | `5.3.0` | Open redirect (unfixed in v5) | Medium | client |
| SCA-08 | `helmet` | `4.4.1` | Outdated; missing CSP defaults | Low | api |
| SCA-09 | `dotenv` | `8.2.0` | Outdated; prototype pollution risk | Low | api |
| SCA-10 | `nodemon` | `2.0.7` | CVE-2022-25912 (transitive) | Medium | api |

---

## Secret Exposure

| ID | File | Type | Value |
|----|------|------|-------|
| SEC-01 | `packages/api/.env.example` | Hardcoded JWT secret | `Sup3rS3cr3tK3y!TaskFlow2024` |
| SEC-02 | `packages/api/src/routes/auth.js` | Password in log | Printed to stdout on every login |

---

## Evaluation Scorecard

### SAST Coverage (25 targets)
| ID | Description | GHAS | Snyk |
|----|-------------|------|------|
| SAST-01 | eval() injection | ☐ | ☐ |
| SAST-02 | OS command injection | ☐ | ☐ |
| SAST-03 | Path traversal | ☐ | ☐ |
| SAST-04 | SSRF | ☐ | ☐ |
| SAST-05 | SQL injection | ☐ | ☐ |
| SAST-06 | Reflected XSS | ☐ | ☐ |
| SAST-07 | XXE | ☐ | ☐ |
| SAST-08 | Insecure deserialization | ☐ | ☐ |
| SAST-09 | Open redirect | ☐ | ☐ |
| SAST-10 | Sensitive data exposure | ☐ | ☐ |
| SAST-11 | Prototype pollution (merge) | ☐ | ☐ |
| SAST-12 | Credential logging | ☐ | ☐ |
| SAST-13 | Weak JWT algorithm | ☐ | ☐ |
| SAST-14 | Username enumeration | ☐ | ☐ |
| SAST-15 | No rate limiting | ☐ | ☐ |
| SAST-16 | Auth bypass (dev mode) | ☐ | ☐ |
| SAST-17 | JWT alg confusion | ☐ | ☐ |
| SAST-18 | Helmet misconfiguration | ☐ | ☐ |
| SAST-19 | Permissive CORS | ☐ | ☐ |
| SAST-20 | Stack trace leak | ☐ | ☐ |
| SAST-21 | Version fingerprinting | ☐ | ☐ |
| SAST-22 | JWT in localStorage | ☐ | ☐ |
| SAST-23 | Unverified JWT decode | ☐ | ☐ |
| SAST-24 | BOLA / IDOR | ☐ | ☐ |
| SAST-25 | Mass assignment | ☐ | ☐ |
| | **SAST Total** | **/25** | **/25** |

### DAST Coverage (17 targets)
| ID | Endpoint | OWASP ZAP | Burp Suite |
|----|----------|-----------|------------|
| DAST-01 | /api/vuln/eval | ☐ | ☐ |
| DAST-02 | /api/vuln/cmd | ☐ | ☐ |
| DAST-03 | /api/vuln/file | ☐ | ☐ |
| DAST-04 | /api/vuln/fetch | ☐ | ☐ |
| DAST-05 | /api/vuln/users (SQLi) | ☐ | ☐ |
| DAST-06 | /api/vuln/greet (XSS) | ☐ | ☐ |
| DAST-07 | /api/vuln/xml (XXE) | ☐ | ☐ |
| DAST-08 | /api/vuln/deserialize | ☐ | ☐ |
| DAST-09 | /api/vuln/redirect | ☐ | ☐ |
| DAST-10 | /api/vuln/profile (IDOR) | ☐ | ☐ |
| DAST-11 | /api/vuln/merge | ☐ | ☐ |
| DAST-12 | /api/auth/login (brute) | ☐ | ☐ |
| DAST-13 | JWT alg:none bypass | ☐ | ☐ |
| DAST-14 | /api/admin BOLA | ☐ | ☐ |
| DAST-15 | /api/admin mass assign | ☐ | ☐ |
| DAST-16 | Missing headers | ☐ | ☐ |
| DAST-17 | Stack trace in 500 | ☐ | ☐ |
| | **DAST Total** | **/17** | **/17** |

### SCA Coverage (10 targets)
| ID | Package | GHAS | Snyk |
|----|---------|------|------|
| SCA-01 | axios 0.21.1 | ☐ | ☐ |
| SCA-02 | jsonwebtoken 8.5.1 | ☐ | ☐ |
| SCA-03 | sequelize 6.6.2 | ☐ | ☐ |
| SCA-04 | xml2js 0.4.19 | ☐ | ☐ |
| SCA-05 | vite 2.9.9 | ☐ | ☐ |
| SCA-06 | react 17.0.2 | ☐ | ☐ |
| SCA-07 | react-router-dom 5.3.0 | ☐ | ☐ |
| SCA-08 | helmet 4.4.1 | ☐ | ☐ |
| SCA-09 | dotenv 8.2.0 | ☐ | ☐ |
| SCA-10 | nodemon 2.0.7 | ☐ | ☐ |
| | **SCA Total** | **/10** | **/10** |

### Secret Scanning
| ID | File | GHAS | Snyk |
|----|------|------|------|
| SEC-01 | .env.example — JWT secret | ☐ | ☐ |
| SEC-02 | auth.js — password in log | ☐ | ☐ |
| | **Secrets Total** | **/2** | **/2** |

### Overall Tool Quality
| Dimension | GHAS | Snyk |
|-----------|------|------|
| Total detected (54 max) | /54 | /54 |
| False positives | # | # |
| Severity accuracy vs NVD | % | % |
| Fix/PR auto-generated | ☐ | ☐ |
| Inline PR annotations | ☐ | ☐ |
| IDE plugin available | ☐ | ☐ |
| Time to first finding (min) | | |
| Setup friction (1–5) | | |
| Developer UX (1–5) | | |
| CI integration quality (1–5) | | |

---

## How to Run the Scans

### GHAS (GitHub Native)
````
Repo Settings → Security → Enable:
  ✓ Code scanning (CodeQL — JavaScript)
  ✓ Secret scanning
  ✓ Dependabot alerts
  ✓ Dependabot security updates
Push to main → check Security tab for findings
````

### Snyk (CLI)
```bash
npm install -g snyk
snyk auth
snyk test --all-projects              # SCA — open source deps
snyk code test --all-projects         # SAST — custom code
snyk monitor --all-projects           # continuous monitoring
```

### DAST — OWASP ZAP
```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://localhost:3001 -r zap-report.html
# For authenticated scans, use zap-full-scan.py with auth script
```

### DAST — Manual curl probes (quick check)
```bash
# DAST-01 eval RCE
curl "http://localhost:3001/api/vuln/eval?expr=1%2B1"

# DAST-02 command injection
curl "http://localhost:3001/api/vuln/cmd?host=127.0.0.1"

# DAST-03 path traversal
curl "http://localhost:3001/api/vuln/file?name=../../package.json"

# DAST-05 SQL injection
curl "http://localhost:3001/api/vuln/users?role=%27%20OR%20%271%27%3D%271"

# DAST-06 reflected XSS
curl "http://localhost:3001/api/vuln/greet?name=%3Cscript%3Ealert(document.cookie)%3C%2Fscript%3E"

# DAST-09 open redirect
curl -I "http://localhost:3001/api/vuln/redirect?to=https://evil.example.com"

# DAST-16 missing headers
curl -I "http://localhost:3001/api/projects"
```
