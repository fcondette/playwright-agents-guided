// spec: specs/cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from "../fixtures";
import { HeaderPage } from "../pages/HeaderPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductPage } from "../pages/ProductPage";
import { CartPage } from "../pages/CartPage";

test.describe("Shopping Cart", () => {
	test("View cart with multiple items", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const productsPage = new ProductsPage(page);
		const productPage = new ProductPage(page);
		const cartPage = new CartPage(page);

		// 1. Navigate via the header 'Produits' nav link (nav-link-products) to the product
		// listing, open 'Écouteurs Sans Fil Pro' (product-card-1), and click 'Ajouter au
		// panier' (product-detail-add-to-cart).
		await test.step("Navigate via the header 'Produits' nav link to the product listing, open 'Écouteurs Sans Fil Pro', and click 'Ajouter au panier'", async () => {
			await header.goToProducts();
			await productsPage.openProduct(1);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Écouteurs Sans Fil Pro ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("1");
		});

		// 2. Navigate back to the product listing via the in-app 'Produits' nav link, open
		// 'Hub USB-C 12-en-1' (product-card-2), and click 'Ajouter au panier'
		// (product-detail-add-to-cart).
		await test.step("Navigate back to the product listing via the in-app 'Produits' nav link, open 'Hub USB-C 12-en-1', and click 'Ajouter au panier'", async () => {
			await header.goToProducts();
			await productsPage.openProduct(2);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Hub USB-C 12-en-1 ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("2");
		});

		// 3. Click the header cart icon (cart-button) to open /cart.
		await test.step("Click the header cart icon to open /cart", async () => {
			await header.openCart();
			await expect(cartPage.heading).toBeVisible();
		});

		// 4. Inspect the two line items in the cart list.
		await test.step("Inspect the two line items in the cart list", async () => {
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).toBeVisible();
			await expect(cartPage.unitPrice("199.99 €")).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(cartPage.lineTotal(1)).toHaveText("199.99 €");

			await expect(cartPage.itemHeading("Hub USB-C 12-en-1")).toBeVisible();
			await expect(cartPage.unitPrice("89.99 €")).toBeVisible();
			await expect(cartPage.quantity(2)).toHaveText("1");
			await expect(cartPage.lineTotal(2)).toHaveText("89.99 €");
		});

		// 5. Inspect the order summary panel ('Récapitulatif').
		await test.step("Inspect the order summary panel ('Récapitulatif')", async () => {
			await expect(cartPage.subtotalAmount("Sous-total (2 articles)")).toHaveText(
				"289.98 €",
			);
			await expect(cartPage.totalAmount()).toHaveText("289.98 €");
			await expect(cartPage.shippingAmount).toHaveText("Gratuite");
			await expect(cartPage.checkoutButton).toBeVisible();
			await expect(cartPage.continueShoppingButton).toBeVisible();
		});
	});

	test("Increase quantity", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const productsPage = new ProductsPage(page);
		const productPage = new ProductPage(page);
		const cartPage = new CartPage(page);

		// 1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product-card-1 /
		// product-detail-add-to-cart) to the cart via the product detail page, then open the
		// cart via cart-button.
		await test.step("Add 'Écouteurs Sans Fil Pro' to the cart via the product detail page, then open the cart", async () => {
			await header.goToProducts();
			await productsPage.openProduct(1);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Écouteurs Sans Fil Pro ajouté au panier"),
			).toBeVisible();
			await header.openCart();
			await expect(cartPage.heading).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(header.cartCount).toHaveText("1");
		});

		// 2. Click increase-quantity-1 once.
		await test.step("Click increase-quantity-1 once", async () => {
			await cartPage.increaseQuantity(1);
			await expect(cartPage.quantity(1)).toHaveText("2");
			await expect(header.cartCount).toHaveText("2");
			await expect(cartPage.lineTotal(1)).toHaveText("399.98 €");
			await expect(cartPage.subtotalAmount("Sous-total (2 articles)")).toHaveText(
				"399.98 €",
			);
			await expect(cartPage.totalAmount()).toHaveText("399.98 €");
		});

		// 3. Click increase-quantity-1 a second time.
		await test.step("Click increase-quantity-1 a second time", async () => {
			await cartPage.increaseQuantity(1);
			await expect(cartPage.quantity(1)).toHaveText("3");
			await expect(header.cartCount).toHaveText("3");
			await expect(cartPage.lineTotal(1)).toHaveText("599.97 €");
			await expect(cartPage.subtotalAmount("Sous-total (3 articles)")).toHaveText(
				"599.97 €",
			);
			await expect(cartPage.totalAmount()).toHaveText("599.97 €");
		});
	});

	test("Decrease quantity to zero (removes the item)", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const productsPage = new ProductsPage(page);
		const productPage = new ProductPage(page);
		const cartPage = new CartPage(page);

		// 1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' to the cart via the
		// product detail page, then open the cart via cart-button.
		await test.step("Add 'Écouteurs Sans Fil Pro' to the cart via the product detail page, then open the cart", async () => {
			await header.goToProducts();
			await productsPage.openProduct(1);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Écouteurs Sans Fil Pro ajouté au panier"),
			).toBeVisible();
			await header.openCart();
			await expect(cartPage.heading).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).toBeVisible();
		});

		// 2. Click decrease-quantity-1 once (quantity goes from 1 to 0).
		await test.step("Click decrease-quantity-1 once (quantity goes from 1 to 0)", async () => {
			await cartPage.decreaseQuantity(1);
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).not.toBeAttached();
			await expect(cartPage.quantity(1)).not.toBeAttached();
			await expect(cartPage.decreaseQuantityButton(1)).not.toBeAttached();
			await expect(cartPage.increaseQuantityButton(1)).not.toBeAttached();
			await expect(cartPage.removeItemButton(1)).not.toBeAttached();
			await expect(cartPage.emptyHeading).toBeVisible();
			await expect(cartPage.emptyMessage).toBeVisible();
			await expect(header.cartCount).not.toBeAttached();
		});
	});

	test("Remove a single item from a multi-item cart", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const productsPage = new ProductsPage(page);
		const productPage = new ProductPage(page);
		const cartPage = new CartPage(page);

		// 1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product 1) and then,
		// via an in-app return to the product listing, add 'Hub USB-C 12-en-1' (product 2) to
		// the cart. Open the cart via cart-button.
		await test.step("Add 'Écouteurs Sans Fil Pro' and then, via an in-app return to the product listing, 'Hub USB-C 12-en-1' to the cart, then open the cart", async () => {
			await header.goToProducts();
			await productsPage.openProduct(1);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Écouteurs Sans Fil Pro ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("1");

			await header.goToProducts();
			await productsPage.openProduct(2);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Hub USB-C 12-en-1 ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("2");

			await header.openCart();
			await expect(cartPage.heading).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(cartPage.quantity(2)).toHaveText("1");
			await expect(header.cartCount).toHaveText("2");
		});

		// 2. Click remove-item-2 (trash/remove control on the 'Hub USB-C 12-en-1' row).
		await test.step("Click remove-item-2 (trash/remove control on the 'Hub USB-C 12-en-1' row)", async () => {
			await cartPage.removeItem(2);
			await expect(cartPage.itemHeading("Hub USB-C 12-en-1")).not.toBeAttached();
			await expect(cartPage.removeItemButton(2)).not.toBeAttached();
			await expect(cartPage.quantity(2)).not.toBeAttached();
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(header.cartCount).toHaveText("1");
			await expect(cartPage.subtotalAmount("Sous-total (1 article)")).toHaveText(
				"199.99 €",
			);
			await expect(cartPage.totalAmount()).toHaveText("199.99 €");
		});
	});

	test("Clear the entire cart", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const productsPage = new ProductsPage(page);
		const productPage = new ProductPage(page);
		const cartPage = new CartPage(page);

		// 1. Using the authenticated fixture, add 'Écouteurs Sans Fil Pro' (product 1) and 'Hub
		// USB-C 12-en-1' (product 2) to the cart via the product detail page (returning to the
		// listing in-app between the two), then open the cart via cart-button.
		await test.step("Add 'Écouteurs Sans Fil Pro' and 'Hub USB-C 12-en-1' to the cart via the product detail page, then open the cart", async () => {
			await header.goToProducts();
			await productsPage.openProduct(1);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Écouteurs Sans Fil Pro ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("1");

			await header.goToProducts();
			await productsPage.openProduct(2);
			await productPage.addToCart();
			await expect(
				productPage.toastMessage("Hub USB-C 12-en-1 ajouté au panier"),
			).toBeVisible();
			await expect(header.cartCount).toHaveText("2");

			await header.openCart();
			await expect(cartPage.heading).toBeVisible();
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).toBeVisible();
			await expect(cartPage.itemHeading("Hub USB-C 12-en-1")).toBeVisible();
			await expect(cartPage.quantity(1)).toHaveText("1");
			await expect(cartPage.quantity(2)).toHaveText("1");
			await expect(header.cartCount).toHaveText("2");
		});

		// 2. Click clear-cart-button ('Vider le panier').
		await test.step("Click clear-cart-button ('Vider le panier')", async () => {
			await cartPage.clearCart();
			await expect(cartPage.emptyHeading).toBeVisible();
			await expect(cartPage.emptyMessage).toBeVisible();
			await expect(cartPage.itemHeading("Écouteurs Sans Fil Pro")).not.toBeAttached();
			await expect(cartPage.itemHeading("Hub USB-C 12-en-1")).not.toBeAttached();
			await expect(cartPage.quantity(1)).not.toBeAttached();
			await expect(cartPage.quantity(2)).not.toBeAttached();
			await expect(cartPage.clearCartButton).not.toBeAttached();
			await expect(cartPage.checkoutButton).not.toBeAttached();
			await expect(header.cartCount).not.toBeAttached();
		});

		// 3. Verify the recovery path: check that browse-products-button ('Voir les produits')
		// is visible.
		await test.step("Verify the recovery path: check that browse-products-button ('Voir les produits') is visible", async () => {
			await expect(cartPage.browseProductsButton).toBeVisible();
			await expect(cartPage.browseProductsButton.locator("xpath=..")).toHaveAttribute(
				"href",
				"/products",
			);
		});
	});

	test("Empty cart state", async ({ authenticatedPage }) => {
		const page = authenticatedPage;
		const header = new HeaderPage(page);
		const cartPage = new CartPage(page);

		// 1. Using the authenticated fixture (fresh, empty cart, no products added), click the
		// header cart icon (cart-button) to open /cart directly without adding anything.
		await test.step("Using the authenticated fixture (fresh, empty cart, no products added), click the header cart icon (cart-button) to open /cart directly without adding anything", async () => {
			await header.openCart();
			await expect(cartPage.emptyHeading).toBeVisible();
		});

		// 2. Inspect the rest of the empty-state page.
		await test.step("Inspect the rest of the empty-state page", async () => {
			await expect(cartPage.emptyMessage).toBeVisible();
			await expect(cartPage.browseProductsButton).toBeVisible();
			await expect(cartPage.clearCartButton).not.toBeAttached();
			await expect(cartPage.checkoutButton).not.toBeAttached();
			await expect(cartPage.continueShoppingButton).not.toBeAttached();
			await expect(header.cartCount).not.toBeAttached();
		});

		// 3. Click browse-products-button ('Voir les produits').
		await test.step("Click browse-products-button ('Voir les produits')", async () => {
			await cartPage.browseProducts();
			await expect(page).toHaveURL("/products");
		});
	});
});
