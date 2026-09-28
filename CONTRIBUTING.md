# Contributing to Time Zones

Thank you for considering contributing to Time Zones! This document explains the process.

## Contributor License Agreement (CLA)

Before your first pull request can be merged, you must accept the [Contributor License Agreement](CLA.md). The process is automated:

1. Open a pull request.
2. The CLA bot will post a comment asking you to sign.
3. Reply with: **I have read the CLA Document and I hereby sign the CLA.**
4. The bot will record your signature and mark the check as passed.

You only need to sign once — it applies to all future contributions.

## License

This project is licensed under the [Apache License 2.0](LICENSE). By contributing, you agree that your contributions will be licensed under the terms described in the [CLA](CLA.md).

## Development Workflow

Time Zones follows a structured development process. Key references:

- **OpenSpec workflow**: `openspec/` directory — changes go through propose, apply, archive stages
- **BDD**: Gherkin scenarios for both unit (vitest-cucumber) and E2E (playwright-bdd) testing
- **TDD**: Red-Green-Refactor cycle with mutation testing (see [CLAUDE.md](CLAUDE.md) for details)
- **Code style**: no hardcoded values, descriptive naming (see `.claude/rules/`)
- **Date/time math**: Temporal API only, IANA time zone identifiers as the source of truth

### Quick Start

```bash
git clone https://github.com/oinsio/time-zones.git
cd time-zones
pnpm install
pnpm dev
```

### Running Tests

```bash
pnpm test              # Unit + BDD unit tests
pnpm build             # Verify build
```

## Pull Request Guidelines

- One logical change per PR
- Include tests for new functionality
- Ensure `pnpm preflight` and `pnpm build` pass before submitting
- Reference relevant issues in the PR description
