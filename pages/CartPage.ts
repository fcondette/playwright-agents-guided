import type { Locator, Page } from "@playwright/test";

export class CartPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly emptyHeading: Locator;
	readonly emptyMessage: Locator;
	readonly checkoutButton: Locator;
	readonly continueShoppingButton: Locator;
	readonly browseProductsButton: Locator;
	readonly clearCartButton: Locator;
	readonly summaryPanel: Locator;
	readonly shippingAmount: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole("heading", { name: "Votre Panier", exact: true });
		this.emptyHeading = page.getByRole("heading", {
			name: "Votre panier est vide",
			exact: true,
		});
		this.emptyMessage = page.getByText(
			"Découvrez notre catalogue et ajoutez des produits à votre panier.",
			{ exact: true },
		);
		this.checkoutButton = page.getByTestId("checkout-button");
		this.continueShoppingButton = page.getByTestId("continue-shopping-button");
		this.browseProductsButton = page.getByTestId("browse-products-button");
		this.clearCartButton = page.getByTestId("clear-cart-button");
		this.summaryPanel = page
			.getByRole("heading", { name: "Récapitulatif", exact: true })
			.locator("xpath=..");
		this.shippingAmount = this.summaryPanel
			.getByText("Livraison", { exact: true })
			.locator("xpath=following-sibling::span");
	}

	itemHeading(name: string): Locator {
		return this.page.getByRole("heading", { name, exact: true });
	}

	unitPrice(price: string): Locator {
		return this.page.getByText(`${price} / unité`, { exact: true });
	}

	quantity(id: number): Locator {
		return this.page.getByTestId(`quantity-${id}`);
	}

	// Scoped to the item row via `quantity-{id}` rather than matched by amount
	// text: the line total, the summary subtotal and the summary total can all
	// show the same amount (e.g. a single-item cart), which makes a page-wide
	// text locator ambiguous (strict mode violation).
	lineTotal(id: number): Locator {
		return this.quantity(id).locator("xpath=../../p");
	}

	increaseQuantityButton(id: number): Locator {
		return this.page.getByTestId(`increase-quantity-${id}`);
	}

	decreaseQuantityButton(id: number): Locator {
		return this.page.getByTestId(`decrease-quantity-${id}`);
	}

	removeItemButton(id: number): Locator {
		return this.page.getByTestId(`remove-item-${id}`);
	}

	async increaseQuantity(id: number) {
		await this.increaseQuantityButton(id).click();
	}

	async decreaseQuantity(id: number) {
		await this.decreaseQuantityButton(id).click();
	}

	async removeItem(id: number) {
		await this.removeItemButton(id).click();
	}

	async clearCart() {
		await this.clearCartButton.click();
	}

	async browseProducts() {
		await this.browseProductsButton.click();
	}

	subtotalAmount(subtotalLabel: string): Locator {
		return this.summaryPanel
			.getByText(subtotalLabel, { exact: true })
			.locator("xpath=following-sibling::span");
	}

	totalAmount(): Locator {
		return this.summaryPanel
			.getByText("Total", { exact: true })
			.locator("xpath=following-sibling::span");
	}
}
