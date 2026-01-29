# P02 — Validation Middleware (Express + Zod + Tests)

A reusable `validate()` middleware for Express that validates `req.body`, `req.params`, and `req.query` using Zod.

## Goal

- Validate request data with Zod schemas
- On validation failure, return a consistent error response:
  - `400` `{ "error": "Bad Request" }`
- On success, provide parsed data to handlers via `req.validated`

## Error Standard (FS Standards)

Validation failures return: `400` `{ "error": "Bad Request" }`

## Middleware

### `validate({ body?, params?, query? })`

- `body`: Zod schema for `req.body`
- `params`: Zod schema for `req.params`
- `query`: Zod schema for `req.query`

If any provided schema fails:

- Respond `400` with `{ "error": "Bad Request" }`
- Do not include Zod error details in the response

If validation succeeds:

- Parsed data is attached to `req.validated`:
  - `req.validated.body`
  - `req.validated.params`
  - `req.validated.query`

## Example Routes

### POST `/widgets` (validates body)

Validates:

- `name`: required non-empty string
- `price`: positive number (coerced)

Response (200):

```json
{ "ok": true, "validated": { "name": "Hammer", "price": 12.5 } }
```

### GET `/widgets/:id` (validates params)

Validates:

- id: route param (schema-defined)

Response (200):

```json
{ "ok": true, "validated": { "id": 123 } }
```

### GET `/search?term=...` (validates query)

Validates:

- term: required non-empty string

Response (200):

```json
{ "ok": true, "validated": { "term": "hammer" } }
```

### Run (dev)

```bash
npm run dev
```

### Test

```bash
npm test

```

### cURL

```bash
# body validation (success)
curl -i -X POST http://localhost:3000/widgets \
  -H "content-type: application/json" \
  -d '{"name":"Hammer","price":12.5}'

# body validation (failure -> 400 Bad Request)
curl -i -X POST http://localhost:3000/widgets \
  -H "content-type: application/json" \
  -d '{"price":12.5}'

# params validation (adjust id to match your schema)
curl -i http://localhost:3000/widgets/123

# query validation (success)
curl -i "http://localhost:3000/search?term=hammer"

# query validation (failure -> 400 Bad Request)
curl -i "http://localhost:3000/search"

```
