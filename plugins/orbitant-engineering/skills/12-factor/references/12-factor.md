# 12-Factor App — Reference Standards

Static checks only. Factors that require runtime access are excluded from scoring
but documented at the bottom so the auditor knows what's not being checked.

Source: [12factor.net](https://12factor.net)

---

## Statically verifiable factors

### II. Dependencies — explicitly declared and isolated
- `package.json` / `requirements.txt` / `pyproject.toml` present
- Lockfile present (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`)
- No dependencies assumed from the system (no undeclared `import` of non-stdlib packages)
- **Fail signal**: missing lockfile, or `requirements.txt` with no version pins

### III. Config — stored in environment, not in code
- No hardcoded URLs, ports, credentials, or environment-specific values in source
- Config loaded via `process.env` (Node) or `os.environ` / `python-dotenv` (Python)
- `.env.example` or equivalent documents required env vars
- **Fail signal**: grep for `localhost`, `127.0.0.1`, `http://`, `https://` hardcoded in non-test source; hardcoded DB connection strings
- **Fail signal**: `.env` committed to repo (covered also in git-hygiene and owasp-patterns)

### V. Build, release, run — strictly separated
- CI pipeline defined (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, etc.)
- Build step is distinct from deploy step in the pipeline
- No build logic mixed into runtime startup (e.g. `npm run build && npm start` in a single Dockerfile CMD)
- **Fail signal**: no CI config at all; single-step "build + deploy" scripts with no separation

### X. Dev/prod parity — keep environments as similar as possible
- `Dockerfile` or `docker-compose.yml` present (signals environment parity intent)
- No environment-specific code paths gated on `NODE_ENV === 'development'` in core logic
- **Fail signal**: large blocks of `if (process.env.NODE_ENV === 'development')` in business logic (config is fine, logic is not)

### XI. Logs — treat as event streams
- App does not manage log files directly (no `fs.createWriteStream` to log files, no `logging.FileHandler` hardcoded)
- Logs go to stdout/stderr
- Structured logging library present (`winston`, `pino`, `structlog`, `loguru`)
- **Fail signal**: `fs.writeFile('app.log', ...)` or `logging.FileHandler('app.log')` in source

---

## Scoring

| Factors passing | Rating |
|---|---|
| 0–2 | ❌ Not 12-factor compliant |
| 3 | ⚠️ Partial |
| 4 | ✅ Good |
| 5 | 🚀 Fully observable compliance |

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
