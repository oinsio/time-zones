---
paths:
  - "**/*_unit.feature"
  - "**/*.feature"
  - "**/steps/*.steps.ts"
  - "**/test/features/**"
  - "vitest.config.ts"
---

# Rule: Unit BDD conventions (vitest-cucumber)

Use **@amiceli/vitest-cucumber** for verifying business logic (domain, application layer) through executable Gherkin specifications without a real browser.

## File Structure

```
packages/client/src/test/features/
└── <feature_name>/
    ├── <feature_name>_<aspect>.feature       # Gherkin specification
    ├── <feature_name>_<aspect>_unit.feature   # (if paired with e2e)
    └── steps/
        └── <feature_name>_<aspect>.steps.ts   # Step definitions (vitest)
```

Example for city_search:
```
city_search/
├── city_search_by_name.feature
├── city_search_by_country.feature
├── city_search_by_abbreviation.feature
├── city_search_ranking.feature
├── city_search_empty_results.feature
├── city_search_nfr_unit.feature
├── city_search_nfr_e2e.feature          # (paired — for playwright-bdd)
└── steps/
    ├── city_search_by_name.steps.ts
    ├── city_search_by_country.steps.ts
    ├── city_search_by_abbreviation.steps.ts
    ├── city_search_ranking.steps.ts
    ├── city_search_empty_results.steps.ts
    └── city_search_nfr_unit.steps.ts
```

## File Naming

- Feature: `<feature>_<aspect>.feature` — snake_case, describes a behavior aspect
- Steps: `<feature>_<aspect>.steps.ts` — one steps file per feature file
- The `_unit` suffix is added only when a paired `_e2e` file exists for the same aspect

## Step Definition Pattern

```typescript
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, type TestContext } from "vitest";

const feature = await loadFeature("../<feature_name>.feature");

type FeatureContext = {
  // Typed context for sharing data between steps
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams<FeatureContext>) => {
  // Real domain services and in-memory stores — no mocks
  const locationStore = createInMemoryLocationStore();

  f.BeforeEachScenario(() => {
    locationStore.clear();
  });

  f.Background(({ Given }) => {
    Given("saved locations exist:", async (_ctx: TestContext, table) => {
      // Seed data from DataTable
    });
  });

  // @<change-name> @FR-X
  f.Scenario("Scenario name from feature", ({ Given, When, Then, And }) => {
    Given("...", async (_ctx: TestContext) => { /* ... */ });
    When("...", async (_ctx: TestContext) => { /* ... */ });
    Then("...", async (_ctx: TestContext) => { /* ... */ });
  });
});
```

## Key Rules

1. **Real implementations** — use actual domain services and stores (in-memory / fake storage), not mocks
2. **Cleanup before each scenario** — `BeforeEachScenario` resets stores and state
3. **DataTable** — Background seeds data from Gherkin tables through factories (`buildLocation`, etc.)
4. **Typed context** — `FeatureContext` for passing data between steps
5. **Tag comment** — before `f.Scenario` add comment `// @<change-name> @FR-X`
6. **loadFeature with relative path** — `await loadFeature("../<feature>.feature")`

## Traceability

- Tags in Gherkin: `@<change-name> @FR-X` above each Scenario
- Comment in steps: `// @<change-name> @FR-X` before `f.Scenario`
- Scenario name in steps **must exactly match** the feature file

## Running

```bash
pnpm test              # All unit tests including *.steps.ts
pnpm test:watch        # Watch mode
```

Vitest picks up steps files via the pattern `src/**/*.steps.{ts,tsx}` in `vitest.config.ts`.

## When to Use Unit BDD vs E2E BDD

| Aspect                        | Unit BDD (vitest-cucumber) | E2E BDD (playwright-bdd) |
|-------------------------------|----------------------------|--------------------------|
| Business logic (TZ math, DST) | yes                        | no                       |
| Data operations (storage)     | yes                        | no                       |
| Performance (operation time)  | yes (performance.now)      | no                       |
| Keyboard accessibility        | no                         | yes                      |
| aria-labels, focus management | no                         | yes                      |
| Responsive layout             | no                         | yes                      |
| CSS animations, transitions   | no                         | yes                      |
| Navigation (URL, routing)     | partially (mock)           | yes                      |

## Dependencies

- `@amiceli/vitest-cucumber` (devDependency)
- Factories: `src/test/factories/` (`buildLocation`, `buildZonedTime`, etc.)
