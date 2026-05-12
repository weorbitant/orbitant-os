# OWASP Patterns — Reference Standards

Static code patterns and dependency checks for Node.js and Python projects.
No runtime access needed — all checks are grep-based or file-based.

Source: OWASP Top 10 (2021), scoped to what's detectable without execution.

---

## Critical (P0) — Immediate risk

### Hardcoded secrets in code
Grep patterns to run across all source files:

```
# Generic patterns
password\s*=\s*["'][^"']{6,}["']
secret\s*=\s*["'][^"']{6,}["']
api_key\s*=\s*["'][^"']{6,}["']
token\s*=\s*["'][^"']{6,}["']

# Provider-specific
sk-[a-zA-Z0-9]{20,}          # OpenAI
ghp_[a-zA-Z0-9]{36}          # GitHub PAT
AKIA[0-9A-Z]{16}              # AWS Access Key
-----BEGIN (RSA|EC|OPENSSH)   # Private keys
```

- Exclude: test fixtures, example files, `*.example`, `*.sample`
- **Any match → P0**

### Code injection via eval / exec
High-risk patterns in Node.js:
```
eval(
new Function(
child_process.exec(        # especially with user-controlled input
child_process.execSync(
```

High-risk patterns in Python:
```
eval(
exec(
os.system(
subprocess.run(.*shell=True
subprocess.call(.*shell=True
pickle.loads(
yaml.load(                  # safe only with Loader=yaml.SafeLoader
```

- Flag all occurrences — manual review required to confirm if user input reaches them
- **Report**: file + line number for each match

---

## Must have

### Weak or broken cryptography (A02)
Node.js:
```
createCipher(              # deprecated, no IV — use createCipheriv
createDecipher(            # deprecated
md5(                       # not for passwords or integrity
sha1(                      # not for passwords or integrity
Math.random()              # not for security tokens/IDs
```

Python:
```
hashlib.md5(               # not for passwords
hashlib.sha1(              # not for passwords
import random              # check if used for security purposes
Crypto.Cipher.DES          # broken cipher
```

**Exception**: MD5/SHA1 are acceptable for non-security purposes (checksums, cache keys). Flag with context.

### SQL injection patterns (A03)
Node.js — string concatenation in queries:
```
query(`SELECT.*\$\{
query(`INSERT.*\$\{
query(`UPDATE.*\$\{
query(`DELETE.*\$\{
query("SELECT.*" +
```

Python — string formatting in queries:
```
execute(f"SELECT
execute("SELECT.*%s" %
execute("SELECT.*".format(
cursor.execute(f"
```

- Parameterized queries (`?`, `$1`, named params) are safe — only flag string interpolation/concatenation

### Security misconfiguration (A05)
Node.js:
```
cors({ origin: '*' })      # overly permissive CORS
cors({origin: "*"})
app.use(cors())            # no config = allow all
NODE_ENV.*development      # check if hardcoded, not env-driven
```

Python (Flask/Django):
```
DEBUG\s*=\s*True           # in non-test files
ALLOWED_HOSTS\s*=\s*\['\*'\]
SECRET_KEY\s*=\s*["']      # hardcoded Django secret key
```

### Missing security headers (A05)
Node.js/Express:
- Check if `helmet` is imported and used: `require('helmet')` or `import helmet`
- **Fail signal**: Express app with no helmet usage

### Insecure authentication patterns (A07)
```
# JWT — algorithm confusion
jwt.verify(.*algorithms.*none
jwt.sign(.*algorithm.*none
verify(token,.*{algorithms: ['none']})

# Weak session secrets
secret: 'secret'
secret: 'keyboard cat'
sessionSecret.*=.*["'][a-z]{1,8}["']
```

---

## Recommended

### Dependency vulnerabilities (A06)
- **Node.js**: `package.json` present → check for `npm audit` integration in CI
  - Flag if no `package-lock.json` or `yarn.lock` / `pnpm-lock.yaml` (unpinned = unauditable)
  - Flag unpinned ranges like `"express": "*"` or `"lodash": "latest"`
- **Python**: `requirements.txt` or `pyproject.toml` present → check for `pip audit` or `safety` in CI
  - Flag unpinned dependencies (no version specifier)
  - Flag `requirements.txt` without a lockfile equivalent (`pip freeze`)

### Software integrity — no lockfile (A08)
- Node.js project with `package.json` but no lockfile → flag
- Python project with `requirements.txt` but no pinned versions → flag
- **Why it matters**: without pinned deps, supply chain attacks can introduce malicious versions silently

### Sensitive data in logs (A09)
```
console.log(.*password
console.log(.*token
console.log(.*secret
console.log(.*req.body    # may contain sensitive fields
print(.*password
print(.*token
logging.*password
```

- Flag occurrences for manual review — context determines severity

### Path traversal (A01)
```
# Node.js
path.join(.*req\.
readFile(.*req\.
readFileSync(.*req\.

# Python
open(.*request\.
os.path.join(.*request\.
```

---

## Scoring

| Result | Rating |
|---|---|
| Any P0 finding | ❌ Critical |
| 0 P0s, all "Must have" pass | ✅ Compliant |
| 0 P0s, "Must have" + 3+ "Recommended" | 🚀 Strong |
| 0 P0s, any "Must have" failing | ⚠️ Needs work |

---

## Findings format

```
🔴  [P0] Possible hardcoded secret
    src/config/database.js:14
    password = "sup3rs3cr3t"
    Recommendation: move to environment variable, rotate immediately if exposed

⚠️  [A02] MD5 used — verify it's not for security purposes
    src/utils/hash.js:8
    md5(userId + timestamp)
    Recommendation: use SHA-256+ if integrity matters; bcrypt/argon2 if it's a password
```

---

## Notes for the auditor

- These are **signals**, not verdicts. Each finding needs a 2-second context check before reporting.
- Focus on patterns where **user-controlled input** reaches the dangerous function — that's the actual risk.
- P0 findings should be called out at the top of the report, before section breakdowns.
