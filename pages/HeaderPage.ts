import type { Locator, Page } from "@playwright/test";

export class HeaderPage {
	readonly page: Page;
	readonly productsNavLink: Locator;
	readonly cartButton: Locator;
	readonly cartCount: Locator;

	constructor(page: Page) {
		this.page = page;
		this.productsNavLink = page.getByTestId("nav-link-products");
		this.cartButton = page.getByTestId("cart-button");
		this.cartCount = page.getByTestId("cart-count");
	}

	async goToProducts() {
		await this.productsNavLink.click();
	}

	async openCart() {
		await this.cartButton.click();
	}
}
