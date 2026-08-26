# Shopping Cart Test Plan

## Application Overview

TechHub is a French-language e-commerce app (shop.missionplaywright.fr). Authenticated users browse a product catalog (`/products`), add items to a client-side cart either via a quick "add-to-cart" button on each product card or via the "Ajouter au panier" button on a product detail page, and manage their cart at `/cart`. The cart page (heading "Votre Panier") lists one row per product with quantity controls (`decrease-quantity-{id}` / `quantity-{id}` / `increase-quantity-{id}`), a per-item `remove-item-{id}` button, and a `clear-cart-button` ("Vider le panier") that empties the whole cart. The header exposes a `cart-link`/`cart-button` with a `cart-count` badge showing the sum of all item quantities; the badge element is absent entirely when the cart is empty. Removing the last unit of an item (via decrease or via explicit remove) deletes its row from the cart; emptying the cart (by removing all items or via "Vider le panier") shows an empty-state view (heading "Votre panier est vide", a description paragraph, and a `browse-products-button` linking back to `/products`). The cart is held in client-side state only: a `page.goto()` or reload clears it, so all navigation after the initial load must be done via in-app link/button clicks. This plan follows the repository's CLAUDE.md conventions: page objects only (no direct `getByTestId`/`getByRole`/`locator` calls in specs), a shared login fixture, `test.describe`/`test.step` structure, readiness assertions before actions, and use of `cart-count` vs `quantity-{id}` per their documented semantics.

## Test Scenarios

### 1. Shopping Cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. View cart with multiple items

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context.
    - expect: Login succeeds and the app shell (header with 'Produits' nav link) is visible, confirming readiness before navigating.
  2. Via in-app navigation (header 'Produits' link), go to the products listing page.
    - expect: The products grid is visible with a product count label (e.g. '12 produits'), confirming the page is ready before any click.
  3. Click the quick add-to-cart button on a first product card (e.g. product id 1, 'Écouteurs Sans Fil Pro').
    - expect: A toast confirms the product was added.
    - expect: The header cart-count badge shows '1'.
  4. Click the quick add-to-cart button on a second, different product card (e.g. product id 8, 'Souris Gaming Elite').
    - expect: The header cart-count badge shows '2' (sum of quantities, one unit each).
  5. Click the header cart link/button to navigate to the cart page via in-app click.
    - expect: The 'Votre Panier' heading is visible, confirming the cart page has rendered before making further assertions.
  6. Assert on the rendered cart contents.
    - expect: Both product names appear as separate line items in the cart.
    - expect: Each line item shows quantity '1' via its own quantity-{id} element.
    - expect: The order summary shows a subtotal label reflecting 2 articles and a total price equal to the sum of the two unit prices.
    - expect: The header cart-count still reads '2'.

#### 1.2. Increase quantity

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context.
    - expect: Login succeeds and the app shell is visible, confirming readiness before navigating.
  2. Via in-app navigation, go to the products listing page and use the quick add-to-cart button to add one product to the cart.
    - expect: The header cart-count badge shows '1' before proceeding.
  3. Click the header cart link to navigate to the cart page.
    - expect: The 'Votre Panier' heading is visible and the product's quantity-{id} element reads '1', confirming a known starting state before mutating it.
  4. Click the increase-quantity-{id} button for that line item once.
    - expect: The quantity-{id} element for that item updates to '2'.
    - expect: The header cart-count updates to '2'.
    - expect: The line item's line total and the order summary's total price update to reflect two units (unit price x 2).
  5. Click the increase-quantity-{id} button for that same item a second time.
    - expect: The quantity-{id} element updates to '3'.
    - expect: The header cart-count updates to '3'.
    - expect: The order summary total updates to reflect three units.

#### 1.3. Decrease quantity to zero (removes the item)

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context.
    - expect: Login succeeds and the app shell is visible, confirming readiness before navigating.
  2. Via in-app navigation, go to the products listing page and use the quick add-to-cart button to add two different products to the cart (so the cart is not left empty prematurely).
    - expect: The header cart-count badge shows '2'.
  3. Click the header cart link to navigate to the cart page.
    - expect: The 'Votre Panier' heading is visible and both products each show quantity-{id} equal to '1', confirming the starting state.
  4. Click the decrease-quantity-{id} button for the first product's line item once (quantity 1 -> 0).
    - expect: That product's line item, along with its quantity-{id}, increase-quantity-{id}, decrease-quantity-{id} and remove-item-{id} elements, is no longer present in the cart.
    - expect: The header cart-count updates to '1', reflecting only the remaining product.
    - expect: The remaining product's own line item and quantity-{id} (still '1') are still visible, proving the cart was not accidentally cleared entirely.
  5. Assert on the order summary.
    - expect: The subtotal/total reflect only the price of the single remaining item.

#### 1.4. Remove a single item from a multi-item cart

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context.
    - expect: Login succeeds and the app shell is visible, confirming readiness before navigating.
  2. Via in-app navigation, go to the products listing page and use the quick add-to-cart button to add two different products to the cart.
    - expect: The header cart-count badge shows '2'.
  3. Click the header cart link to navigate to the cart page.
    - expect: The 'Votre Panier' heading is visible and both product line items are present, confirming the starting state.
  4. Click the remove-item-{id} button for the first product's line item.
    - expect: The first product's line item (and its quantity-{id}, increase-quantity-{id}, decrease-quantity-{id}, remove-item-{id}) is no longer present in the cart.
    - expect: The second product's line item is still visible with its quantity-{id} unchanged, proving only the targeted item was removed and the cart was not cleared.
    - expect: The header cart-count updates to '1'.
    - expect: The order summary total updates to reflect only the remaining item's price.

#### 1.5. Clear the entire cart

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context.
    - expect: Login succeeds and the app shell is visible, confirming readiness before navigating.
  2. Via in-app navigation, go to the products listing page and use the quick add-to-cart button to add two different products to the cart.
    - expect: The header cart-count badge shows '2'.
  3. Click the header cart link to navigate to the cart page.
    - expect: The 'Votre Panier' heading is visible and both product line items are present, confirming the cart is populated before it is cleared (so the later empty-state assertion is not vacuous).
  4. Click the clear-cart-button ('Vider le panier').
    - expect: The cart switches to the empty-cart view: the 'Votre panier est vide' heading is visible.
    - expect: The descriptive paragraph inviting the user to browse the catalogue is visible.
    - expect: The browse-products-button ('Voir les produits') is visible.
    - expect: Neither product line item nor any quantity-{id}/remove-item-{id} elements remain on the page.
    - expect: The header cart-count badge is no longer present (or shows no count), since the cart is empty.

#### 1.6. Empty cart state

**File:** `tests/cart/cart.spec.ts`

**Steps:**
  1. Use the shared login fixture to log in as the seeded test user, starting from a fresh browser context (do not add any products to the cart).
    - expect: Login succeeds and the app shell is visible, confirming readiness before navigating.
  2. Click the header cart link to navigate directly to the cart page with no items ever having been added.
    - expect: The page reaches a ready state: the 'Votre panier est vide' heading is visible.
  3. Assert on the full empty-state content.
    - expect: The descriptive paragraph ('Découvrez notre catalogue et ajoutez des produits à votre panier.') is visible.
    - expect: The browse-products-button ('Voir les produits') is visible and links to the products page.
    - expect: No order summary (subtotal/total/checkout-button) is rendered.
    - expect: The header cart-count badge element is not present, consistent with a cart containing zero items.
  4. Click the browse-products-button.
    - expect: The app navigates to the products listing page ('Notre Catalogue' heading visible), confirming the empty-state CTA is functional.
