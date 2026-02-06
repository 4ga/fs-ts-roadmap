# P04 — Logging + Request ID (Express + TS + Tests)

Structured JSON logging + request correlation for an Express + TypeScript service.

## What this project demonstrates

- `requestId()` middleware:
  - Uses inbound `x-request-id` if present; otherwise generates one
  - Attaches `req.requestId`
  - Always sets response header `x-request-id`

- Structured JSON logger:
  - Single-line JSON output
  - Deterministic via injectable `write()` and `now()` (tested)

- `httpLogger()` middleware:
  - Logs once at end of request (`finish`)
  - Includes: `level`, `msg`, `time`, `requestId`, `method`, `path`, `status`, `durationMs`

- Redaction:
  - Secrets are redacted in logs (case-insensitive keys)
  - Works for nested objects/arrays

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

### Run tests

```bash
npm test
```

### Request ID

- If client sends `x-request-id`, server echoes the same value back.
- If omitted, server generates one and returns it in `x-request-id`.

##### Example:

```bash
curl -i http://localhost:3000/ok \
  -H "x-request-id: test-id-123"
```

### Sample log line

#### Example `httpLogger` output (single line JSON):

```json
{
  "level": "info",
  "msg": "http request",
  "time": "2000-01-01T00:00:00.000Z",
  "requestId": "test-id-123",
  "method": "GET",
  "path": "/ok",
  "status": 200,
  "durationMs": 3,
  "headers": { "authorization": "[REDACTED]", "cookie": "[REDACTED]" }
}
```

### Reaction rules

##### Keys are matched case-insensitively and redacted anywhere in the logged object:

- `authorization`
- `cookie`
- `set-cookie`
- `password`
- `token`
- `accessToken`
- `refreshToken`

##### Redacted values become: `"[REDACTED]".`

### Project Structure

```text
src/
  app.ts                      # Express app wiring
  appLogger.ts                # Production logger instance (stdout + real time)
  logger.ts                   # createLogger() + redact()
  middleware/
    requestId.ts              # request correlation middleware
    httpLogger.ts             # request logging middleware (logs on finish)
    errorLogger.ts            # error logging middleware (logs + passes through)
  types/
    express.d.ts              # adds req.requestId typing
tests/
  requestId.int.test.ts
  logger.unit.test.ts
  httpLogger.int.test.ts
  errorLogger.int.test.ts

```

### Standards

- No `console.log` in app code (use the logger)
- Tests are deterministic (fixed time, no timing assertions)
- Errors keep the standard response shape {"error": "string"} (no stack leaks)
