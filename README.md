# Elate API Client

TypeScript client for the Elate API.

## Installation

```sh
yarn add @goelate/elate-api-client
# or: npm install @goelate/elate-api-client
```

## Quickstart

```ts
import { ElateClient } from "@goelate/elate-api-client";

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
const apiKey = process.env.ELATE_API_KEY;
if (!apiKey) {
  throw new Error("ELATE_API_KEY environment variable is required");
}

const elate = new ElateClient({
  baseUrl: "https://evoke.goelate.com",
  apiKey,
  headers: {
    "x-request-source": "my-integration",
  },
  timeoutMs: 30_000,
  maxRetries: 2,
});
```

The client uses native `fetch`. Pass `fetch` when running in a custom environment or when testing.
Use a trusted HTTPS `baseUrl`; the API key is sent as a bearer token to that URL.

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
import { ElateApiError } from "@goelate/elate-api-client";

try {
  await elate.users.list({ page: 0, limit: 25 });
} catch (error) {
  if (error instanceof ElateApiError) {
    console.error(error.status, error.body);
  }
}
```

Error bodies and response headers may contain sensitive API or customer data. Avoid logging them without reviewing and redacting the contents.

## PDF Reports

```ts
const pdf = await elate.reports.getPdf(123);
```

`getPdf` returns an `ArrayBuffer`.

## TypeScript

Request and response types are exported from the package and generated from the public OpenAPI document.

```ts
import type { ObjectiveCollectionResponse } from "@goelate/elate-api-client";
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

## Publishing

Releases are published from GitHub Actions when a version tag such as `v0.1.0` is pushed. The workflow verifies generated types, tests the package, checks the packed artifact, and publishes with npm provenance.

Before the first release, configure the npm package's trusted publisher for this repository and the `Release Package` workflow. No long-lived npm token is required when trusted publishing is enabled.

For a local package review, run:

```sh
yarn generate
git diff --exit-code -- src/generated/schema.ts
yarn lint
yarn typecheck
yarn test
yarn build
npm publish --dry-run --access public
```

## License

[MIT](LICENSE)
