# P06 — Widgets REST CRUD (In-Memory) (Express + TypeScript + Tests)

A small, fully-tested REST API using an **in-memory store** to practice routing, validation, pagination, and consistent contracts.

- Resource: **widgets**
- Base path: **/widgets**
- Storage: **in-memory** (per app instance)
- Determinism: **ID generator + clock injected** (tests are deterministic)

---

## Requirements / Standards

- Errors are always JSON: `{ "error": "string" }`
- Validation failures: `400 { "error": "Bad Request" }`
- Unknown routes: `404 { "error": "Not Found" }`
- Missing resource: `404 { "error": "Not Found" }`
- Responses include `x-request-id` header (generated or echoed from request)
- Integration tests cover success + error cases (Vitest + Supertest)

---

## API

### Widget shape

```json
{
  "id": "w_1",
  "name": "Example",
  "createdAt": "2020-01-01T00:00:00.000Z"
}
```

**ID format:** `w_<digits>` (example: `w_1`, `w_25`)

---

## Endpoints

### POST `/widgets`

Create a widget.

**Body**

```json
{ "name": "string" }
```

**Validation**

- `name` required
- trimmed
- 1–100 chars

**Responses**

- `201` with created widget
- `400 { "error": "Bad Request" }`

**curl**

```bash
curl -i -X POST http://localhost:3000/widgets   -H "Content-Type: application/json"   -H "x-request-id: demo-create-1"   -d '{ "name": "Alpha" }'
```

---

### GET `/widgets`

List widgets with pagination.

**Query params**

- `limit` (default: `20`, min: `0`)
- `offset` (default: `0`, min: `0`)

**Response**

```json
{
  "items": [
    /* widgets */
  ],
  "limit": 20,
  "offset": 0,
  "total": 2
}
```

**Responses**

- `200` with list payload
- `400 { "error": "Bad Request" }`

**curl**

```bash
# defaults (limit=20, offset=0)
curl -i http://localhost:3000/widgets

# pagination
curl -i "http://localhost:3000/widgets?limit=2&offset=0"
```

---

### GET `/widgets/:id`

Fetch a widget by id.

**Responses**

- `200` with widget
- `400 { "error": "Bad Request" }` (invalid id format)
- `404 { "error": "Not Found" }` (valid id format, not present)

**curl**

```bash
curl -i http://localhost:3000/widgets/w_1
```

---

### PUT `/widgets/:id`

Update a widget’s name.

**Body**

```json
{ "name": "string" }
```

**Responses**

- `200` with updated widget
- `400 { "error": "Bad Request" }`
- `404 { "error": "Not Found" }`

**curl**

```bash
curl -i -X PUT http://localhost:3000/widgets/w_1   -H "Content-Type: application/json"   -d '{ "name": "Updated Name" }'
```

---

### DELETE `/widgets/:id`

Delete a widget.

**Responses**

- `204` (no content)
- `400 { "error": "Bad Request" }`
- `404 { "error": "Not Found" }`

**curl**

```bash
curl -i -X DELETE http://localhost:3000/widgets/w_1
```

---

## Request ID

- If you send an `x-request-id` header, the server echoes it back.
- Otherwise, the server generates one.
- All responses (success + error) include `x-request-id`.

Example:

```bash
curl -i http://localhost:3000/widgets -H "x-request-id: demo-req-1"
```

---

## Scripts

From the `p06` package directory:

```bash
# install deps (if needed)
npm install

# run tests
npm test

# start dev server (if you have a dev script)
npm run dev

# start server (if you have a start script)
npm start
```

> Note: exact scripts may vary depending on your monorepo setup; tests are expected to pass deterministically.

---

## Notes

- This project intentionally uses **in-memory storage** to focus on routing/contracts/tests.
- P07 will introduce SQLite + migrations + more “real” persistence concerns.
