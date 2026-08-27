# Test suite conventions

## Architecture

- Every spec imports page objects from `pages/`. Specs never call
  `page.getByTestId()`, `page.getByRole()` or `page.locator()` directly.
- Page objects contain actions and navigation only. Never put assertions
  in a page object.
- Login and other shared setup live in a fixture in `fixtures/index.ts`,
  registered via `base.extend()`. Never repeat login in a spec file.
- Credentials are declared once, in the fixture. Never redeclare them
  per spec.
- Group related tests in one file with `test.describe()`. Do not create
  one file per test.
- Use `test.step()` consistently across all specs.

## Test isolation

Each `test()` gets a fresh browser context. `tests/seed.spec.ts` does NOT
run automatically before other tests — it exists only as a reference for
the planner. Every test must build its own state via the fixture.

## Readiness

The app renders asynchronously. Clicking before an element is ready
silently fails, and the test then fails later at a confusing point.

- Assert readiness before every action that follows a navigation.
- Assert setup state before asserting an absence. A test whose final
  assertion is satisfied by an empty page can pass vacuously.
- `await expect(locator)` — never `expect(await ...)`, which does not retry.
- Never use `waitForTimeout()`. Assert on an element that proves readiness.

## Locators

- `getByTestId` first. `getByRole` / `getByLabel` as fallbacks.
- Use `{ exact: true }` on text-based locators. French labels nest:
  "Nom" is a substring of "Prénom", which causes strict mode violations.
- EXCEPTION: do not use `exact: true` on product card links. Their
  accessible name includes the price and category, not just the product name.
- Toasts: this app uses Sonner. Two toasts can be on screen at once, so
  `[data-sonner-toast]` may match multiple elements. Assert on a stable
  element such as `cart-count` instead.

## Application constraints

- Cart state is client-side only. `page.goto()` or a page reload after
  adding items clears the cart. After the initial `page.goto("/")`, navigate
  only via in-app clicks.
- `cart-count` in the header is the sum of all quantities. `quantity-{id}`
  is the quantity of one line item.
- Add products to the cart via the product detail page: click the product
  card link from `/products`, then `product-detail-add-to-cart`. Do not use
  the quick `add-to-cart-{id}` button on product cards — it is only revealed
  on hover within a narrow region of the card and is unreliable in automation.
