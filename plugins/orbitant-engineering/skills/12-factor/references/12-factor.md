# 12-Factor App — Reference Standards

Static checks only. Factors that require runtime access are excluded from scoring
but documented at the bottom so the auditor knows what's not being checked.

Source: <https://12factor.net>

Each scored factor lists:

- **Evidence**: what to look at in the repository to judge the factor.
- **Compliant**: what the evidence shows when the factor holds.
- **Fail signal**: what fails the factor on sight.
- **Exclude**: what never counts as a fail signal.

File names are examples from common stacks (Node.js, Python, Go, Ruby, Rust). For any
other stack, look for its equivalent: the principle is what is judged, not the file name.

---

## Statically verifiable factors

### II. Dependencies — explicitly declared and isolated

- **Evidence**: the repository's file list; the dependency manifest and its lockfile.
- **Compliant**:
  - A dependency manifest is present (`package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Gemfile`, `Cargo.toml`)
  - Its lockfile is present (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`, `uv.lock`, `go.sum`, `Gemfile.lock`, `Cargo.lock`)
  - No dependency is assumed from the system (no import of a non-standard-library package the manifest does not declare)
- **Fail signal**: no lockfile, or a manifest with unpinned versions and no lockfile (e.g. `requirements.txt` without `==` pins).

### III. Config — stored in environment, not in code

- **Evidence**: the non-test source; the file list (a committed `.env`, a `.env.example` or equivalent).
- **Compliant**:
  - URLs, ports, credentials and environment-specific values are read from the environment (`process.env`, `os.environ`, `os.Getenv`, `ENV`)
  - `.env.example` or equivalent documents the required variables
- **Fail signal**: a hardcoded `localhost`, `127.0.0.1`, `http://` or `https://` endpoint, port or credential in non-test source; a hardcoded database connection string.
- **Fail signal**: `.env` committed to the repository (also covered by the `orbitant-git-hygiene` and `orbitant-owasp-scan` skills).
- **Exclude**: tests, fixtures, documentation, and example files such as `.env.example`.

### V. Build, release, run — strictly separated

- **Evidence**: the CI configuration (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, etc.); the `Dockerfile` and the start scripts.
- **Compliant**:
  - A CI pipeline is defined
  - Its build step is distinct from its deploy step
  - Runtime startup runs the built artifact, with no build logic in it
- **Fail signal**: no CI configuration at all; a single "build + deploy" step with no separation; build logic in runtime startup (e.g. `npm run build && npm start` as one `Dockerfile` `CMD`).

### X. Dev/prod parity — keep environments as similar as possible

- **Evidence**: the file list (`Dockerfile`, `docker-compose.yml`); the non-test source.
- **Compliant**:
  - A `Dockerfile` or `docker-compose.yml` is present (signals environment parity intent)
  - Environment checks (`NODE_ENV`, `APP_ENV`, `RAILS_ENV`, a `DEBUG` flag) select configuration only
- **Fail signal**: large blocks of business logic gated on the environment (e.g. `if (process.env.NODE_ENV === 'development')` around core behaviour). Config gated on it is fine; logic is not.
- **Exclude**: tests and development tooling.

### XI. Logs — treat as event streams

- **Evidence**: the non-test source; the dependency manifest.
- **Compliant**:
  - Logs go to stdout/stderr
  - A structured logging library is present (`pino`, `winston`, `structlog`, `loguru`, `log/slog`, `zap`)
- **Fail signal**: the app writes its own log files (e.g. `fs.createWriteStream('app.log')`, `fs.writeFile('app.log', ...)`, `logging.FileHandler('app.log')`).

---

## Judging a factor from the evidence you have

Each scored factor ends in one of three states:

- **Passing**: its evidence was observed and shows it compliant.
- **Failing**: a fail signal was observed. One fail signal is enough, even when the rest of the evidence was not seen.
- **Not observed**: its evidence was not available and no fail signal was seen. Name the evidence that is missing.

---

## Scoring

Rate only when all five scored factors are observed (Passing or Failing):

| Factors passing | Rating |
|---|---|
| 0–2 | ❌ Not 12-factor compliant |
| 3 | ⚠️ Partial |
| 4 | ✅ Good |
| 5 | 🚀 Fully observable compliance |

When any scored factor is Not observed, the rating is **❔ Incomplete (n/5 observed)**.
A missing piece of evidence is not a failure: the rating waits for it.

---

## Factors not statically verifiable — excluded from scoring

These factors exist in the 12-factor methodology but cannot be assessed from a repo scan alone.
Flag them in the report as "not checked — requires runtime or architecture review."

| Factor | Why it's excluded |
|---|---|
| **I. Codebase** — one codebase, many deploys | Requires knowledge of deployment topology, not visible in the repo |
| **IV. Backing services** — treated as attached resources | Requires runtime config or infra definitions (Terraform, Helm) outside the repo |
| **VI. Processes** — stateless, share-nothing | Requires runtime observation; stateful patterns can be hard to detect statically |
| **VII. Port binding** — export services via port binding | Requires running the app or reading infra config |
| **VIII. Concurrency** — scale via process model | Requires runtime or deployment config (Kubernetes replicas, PM2 cluster mode) |
| **IX. Disposability** — fast startup, graceful shutdown | Requires runtime measurement |
| **XII. Admin processes** — run as one-off processes | Requires knowledge of how ops tasks are executed in the environment |
