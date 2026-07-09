# Contributing

Thank you for your interest in improving the Elate API Client. This package is a TypeScript SDK for the Elate API, and contributions should keep the public API stable, typed, and easy to use.

## Ways to Contribute

- Report bugs with a clear description, reproduction steps, expected behavior, and actual behavior.
- Request API client improvements by describing the use case and the Elate API behavior involved.
- Open pull requests for focused fixes, tests, documentation improvements, or generated type updates.

## Development Setup

This repository uses Node.js and Yarn through Corepack.

```sh
corepack enable
yarn install
```

The recommended local tool versions are listed in `mise.toml`.

## Generated API Types

Request and response types are generated from the public Elate OpenAPI document:

```sh
yarn generate
```

Run this command when the upstream OpenAPI schema changes or when a contribution depends on updated API types. Generated changes to `src/generated/schema.ts` should be committed with the related source changes.

## Validation

Before opening a pull request, run the relevant checks locally:

```sh
yarn lint
yarn typecheck
yarn test
yarn build
```

For packaging-related changes, also run:

```sh
yarn pack:check
```

Pull requests run the same checks in CI, including verification that generated OpenAPI types are up to date.

## Coding Guidelines

- Keep changes focused and avoid unrelated refactors.
- Preserve the package's TypeScript-first public API and exported types.
- Add or update tests when changing behavior.
- Prefer small, explicit changes over broad abstractions.
- Do not commit credentials, API keys, tokens, or private customer data.
- Keep examples safe to run and use environment variables for secrets.

## Pull Requests

When opening a pull request:

- Describe the user-visible change and why it is needed.
- Link any related issue or story when available.
- Include testing performed, especially for generated type changes or API behavior changes.
- Update `README.md` or examples when changing usage patterns.
- Update `CHANGELOG.md` for user-visible changes.

Maintainers may ask for changes before merging. Please keep discussions respectful and focused on the technical outcome.

## License

By contributing to this repository, you agree that your contributions will be licensed under the MIT License used by this project.
