# Elate API Client

TypeScript client for the Elate API.

## Installation

```sh
yarn add @goelate/api-client
```

## Quickstart

```ts
import { ElateClient } from "@goelate/api-client";

const apiKey = process.env.ELATE_API_KEY;
if (!apiKey) {
  throw new Error("ELATE_API_KEY environment variable is required");
}
const elate = new ElateClient({
  baseUrl: "https://evoke.goelate.com",
  apiKey,
});

const objectives = await elate.objectives.list({
  start: "2026-01-01",
  end: "2026-03-31",
  page: 0,
  limit: 25,
});
```

## Configuration

```ts
const elate = new ElateClient({
  baseUrl: "https://evoke.goelate.com",
  apiKey: "elate_api_key",
  headers: {
    "x-request-source": "my-integration",
  },
  fetch: customFetch,
});
```

The client uses native `fetch`. Pass `fetch` when running in a custom environment or when testing.

## Authentication

The client sends your API key as a bearer token:

```http
Authorization: Bearer <apiKey>
```

## Pagination

List methods accept friendly pagination fields and serialize them to the API's bracketed query parameters.

```ts
await elate.metrics.list({
  start: "2026-01-01",
  end: "2026-03-31",
  page: 0,
  limit: 100,
});
```

## Resources

The client exposes these resource groups:

- `objectives`
- `metrics`
- `goals`
- `comments`
- `themes`
- `tactics`
- `groups`
- `savedViews`
- `users`
- `reports`

Most resources support `list`, `create`, `get`, `update`, and `delete` methods.

## Error Handling

Non-2xx responses throw `ElateApiError`.

```ts
import { ElateApiError } from "@goelate/api-client";

try {
  await elate.users.list({ page: 0, limit: 25 });
} catch (error) {
  if (error instanceof ElateApiError) {
    console.error(error.status, error.body);
  }
}
```

## PDF Reports

```ts
const pdf = await elate.reports.getPdf(123);
```

`getPdf` returns an `ArrayBuffer`.

## TypeScript

Request and response types are exported from the package and generated from the public OpenAPI document.

```ts
import type { ObjectiveCollectionResponse } from "@goelate/api-client";
```

## Development

```sh
yarn install
yarn generate
yarn lint
yarn typecheck
yarn test
yarn build
```

Types are generated from `https://evoke.goelate.com/api/docs/openapi.yaml`.

## License

MIT
