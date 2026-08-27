# Shopping Cart Test Plan

## Application Overview


This plan covers the shopping cart feature of the TechHub demo shop (https://shop.missionplaywright.fr). The app is a French-language e-commerce site. All test code must follow the conventions in CLAUDE.md:

- Specs import page objects from `pages/` and never call `page.getByTestId()` / `getByRole()` / `locator()` directly.
- Page objects contain actions/navigation only, never assertions.
- Login lives in a fixture in `fixtures/index.ts`, registered via `base.extend()` (e.g. an `authenticatedPage` fixture that performs the login flow shown in `tests/seed.spec.ts` before the test body runs). Credentials (`john.doe2@example.com` / `Test12345!`, overridable via `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`) are declared once in the fixture, never repeated in a spec.
- All six scenarios below live in ONE file, `tests/cart.spec.ts`, grouped with `test.describe("Shopping Cart")`, each scenario as a separate `test()`, using `test.step()` for every logical step.
- Cart state is client-side only: `page.goto()` (including a reload) wipes the cart. After the fixture's initial `page.goto("/")` during login, every subsequent navigation must be an in-app click (nav links, product cards, "Continuer mes achats", the cart icon, etc.). Products must only be added to the cart from the product detail page's "Ajouter au panier" button (`product-detail-add-to-cart`), never by any shortcut.
- Assert readiness after every navigation and before every action that follows it (e.g. assert the `Votre Panier` heading is visible before reading quantities; assert the setup state — item present — before asserting an absence, such as an item disappearing).
- Use `await expect(locator)`, never `expect(await ...)`. Never use `waitForTimeout()`.
- Locators: `getByTestId` first, `getByRole`/`getByLabel` as fallback, with `{ exact: true }` on text locators (French labels nest as substrings) EXCEPT on product card links, whose accessible name includes price/category text, not just the product name.
- Toasts use Sonner (`[data-sonner-toast]`); multiple toasts can coexist, so prefer asserting on `cart-count` or on item rows rather than counting toasts. Note: only the "add to cart" action shows a toast (confirmed by exploration: increase/decrease quantity, remove item, and clear cart do NOT produce a toast).
- `cart-count` (testid on the header cart badge) is the SUM of all line-item quantities. When the cart is empty, the `cart-count` element does not exist in the DOM at all (not just hidden/zero).
- `quantity-{id}` is the quantity of one line item, where `{id}` is the product's numeric id (matches its `/product/{id}` URL and its `product-card-{id}` testid on listing pages).

Key selectors discovered by exploring the live app:
- Header: `nav-link-products` ("Produits"), `cart-button` (opens `/cart`), `cart-count` (badge, sum of quantities; absent when cart is empty).
- Product listing: `product-card-{id}` links (e.g. `product-card-1` = "Écouteurs Sans Fil Pro" 199.99 €, `product-card-2` = "Hub USB-C 12-en-1" 89.99 €).
- Product detail: `product-detail-add-to-cart` ("Ajouter au panier").
- Cart page (`/cart`), non-empty state: heading "Votre Panier" (h1), `clear-cart-button` ("Vider le panier"), and per line item: `remove-item-{id}`, `decrease-quantity-{id}`, `quantity-{id}` (text of current quantity), `increase-quantity-{id}`, plus a paragraph "{unit price} € / unité" and a line-total paragraph "{line total} €". Summary panel shows "Sous-total ({n} article(s))" (singular "article" for 1, plural "articles" for 2+), "Total" with the same amount as subtotal (shipping is "Gratuite"), a `checkout-button` ("Passer au paiement", links to `/checkout`) and `continue-shopping-button` ("Continuer mes achats", links to `/products`).
- Cart page, empty state: heading "Votre panier est vide" (h1), paragraph "Découvrez notre catalogue et ajoutez des produits à votre panier.", and `browse-products-button` ("Voir les produits", links to `/products`). None of `clear-cart-button`, `remove-item-*`, `checkout-button` exist in this state.
- Add-to-cart toast text: "{Product name} ajouté au panier" (verified: "Écouteurs Sans Fil Pro ajouté au panier").


## Test Scenarios

### 1. Shopping Cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. View cart with multiple items

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Start from the authenticated fixture (fresh browser context, logged in, cart empty). Use the ProductsPage/ProductPage page objects: navigate via the header 'Produits' nav link (nav-link-products) to the product listing, open 'Écouteurs Sans Fil Pro' (product-card-1), and click 'Ajouter au panier' (product-detail-add-to-cart).
    - expect: A Sonner toast containing 'Écouteurs Sans Fil Pro ajouté au panier' becomes visible
    - expect: The header cart-count badge shows '1'
  2. Navigate back to the product listing via the in-app 'Produits' nav link, open 'Hub USB-C 12-en-1' (product-card-2), and click 'Ajouter au panier' (product-detail-add-to-cart).
    - expect: A Sonner toast containing 'Hub USB-C 12-en-1 ajouté au panier' becomes visible
    - expect: The header cart-count badge shows '2'
  3. Click the header cart icon (cart-button) to open /cart.
    - expect: The 'Votre Panier' heading is visible (readiness check before reading any cart contents)
  4. Inspect the two line items in the cart list.
    - expect: A row for 'Écouteurs Sans Fil Pro' is visible showing unit price '199.99 € / unité', quantity-1 text equal to '1', and a line total of '199.99 €'
    - expect: A row for 'Hub USB-C 12-en-1' is visible showing unit price '89.99 € / unité', quantity-2 text equal to '1', and a line total of '89.99 €'
  5. Inspect the order summary panel ('Récapitulatif').
    - expect: The subtotal line reads 'Sous-total (2 articles)' with amount '289.98 €'
    - expect: The 'Total' line reads '289.98 €' and shipping reads 'Gratuite'
    - expect: The checkout-button ('Passer au paiement') and continue-shopping-button ('Continuer mes achats') are both visible

#### 1.2. Increase quantity

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product-card-1 / product-detail-add-to-cart) to the cart via the product detail page, then open the cart via cart-button.
    - expect: The 'Votre Panier' heading is visible
    - expect: quantity-1 reads '1' and cart-count reads '1' (setup state confirmed before mutating it)
  2. Click increase-quantity-1 once.
    - expect: quantity-1 updates to '2'
    - expect: The header cart-count updates to '2'
    - expect: The line total for the item updates to '399.98 €'
    - expect: The summary subtotal reads 'Sous-total (2 articles)' with amount '399.98 €' and the 'Total' reads '399.98 €'
  3. Click increase-quantity-1 a second time.
    - expect: quantity-1 updates to '3'
    - expect: cart-count updates to '3'
    - expect: The line total updates to '599.97 €' and the summary subtotal/'Total' both read '599.97 €' with 'Sous-total (3 articles)'

#### 1.3. Decrease quantity to zero (removes the item)

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' to the cart via the product detail page, then open the cart via cart-button.
    - expect: The 'Votre Panier' heading is visible
    - expect: quantity-1 reads '1' (setup state confirmed) and the 'Écouteurs Sans Fil Pro' row is visible
  2. Click decrease-quantity-1 once (quantity goes from 1 to 0).
    - expect: The 'Écouteurs Sans Fil Pro' row and the quantity-1/decrease-quantity-1/increase-quantity-1/remove-item-1 controls are no longer present in the DOM
    - expect: The cart switches to the empty state: heading 'Votre panier est vide' is visible, with paragraph 'Découvrez notre catalogue et ajoutez des produits à votre panier.'
    - expect: The header cart-count element no longer exists (cart is empty)

#### 1.4. Remove a single item from a multi-item cart

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product 1) and then, via an in-app return to the product listing, add 'Hub USB-C 12-en-1' (product 2) to the cart. Open the cart via cart-button.
    - expect: The 'Votre Panier' heading is visible
    - expect: Both quantity-1 and quantity-2 read '1' and cart-count reads '2' (setup state confirmed before removing anything)
  2. Click remove-item-2 (trash/remove control on the 'Hub USB-C 12-en-1' row).
    - expect: The 'Hub USB-C 12-en-1' row and its remove-item-2/quantity-2 controls are no longer present
    - expect: The 'Écouteurs Sans Fil Pro' row is still visible with quantity-1 still '1'
    - expect: The header cart-count updates to '1'
    - expect: The summary subtotal reads 'Sous-total (1 article)' with amount '199.99 €' and 'Total' reads '199.99 €'

#### 1.5. Clear the entire cart

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product 1) and 'Hub USB-C 12-en-1' (product 2) to the cart via the product detail page (returning to the listing in-app between the two), then open the cart via cart-button.
    - expect: The 'Votre Panier' heading is visible
    - expect: Both product rows are visible with quantity-1 and quantity-2 equal to '1', and cart-count reads '2' (setup state confirmed before clearing)
  2. Click clear-cart-button ('Vider le panier').
    - expect: The cart switches immediately to the empty state (no confirmation dialog is presented): heading 'Votre panier est vide' is visible with paragraph 'Découvrez notre catalogue et ajoutez des produits à votre panier.'
    - expect: Neither of the two product rows nor clear-cart-button/checkout-button is present any more
    - expect: The header cart-count element no longer exists
  3. Verify the recovery path: check that browse-products-button ('Voir les produits') is visible.
    - expect: browse-products-button is visible and is a link to /products

#### 1.6. Empty cart state

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Using the authenticated fixture (fresh, empty cart, no products added), click the header cart icon (cart-button) to open /cart directly without adding anything.
    - expect: The heading 'Votre panier est vide' is visible (readiness confirmed for the empty state)
  2. Inspect the rest of the empty-state page.
    - expect: The paragraph 'Découvrez notre catalogue et ajoutez des produits à votre panier.' is visible
    - expect: browse-products-button ('Voir les produits') is visible
    - expect: clear-cart-button, checkout-button, continue-shopping-button, and any remove-item-*/quantity-* controls are NOT present (absence asserted only after the empty-state heading confirmed the page is actually in the empty state)
    - expect: The header cart-count badge element does not exist
  3. Click browse-products-button ('Voir les produits').
    - expect: The app navigates to /products and the 'Notre Catalogue' heading becomes visible, confirming the empty-state call-to-action works
