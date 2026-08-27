import type { Locator, Page } from "@playwright/test";

export class ProductPage {
	readonly page: Page;
	readonly addToCartButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.addToCartButton = page.getByTestId("product-detail-add-to-cart");
	}

	async addToCart() {
		await this.addToCartButton.click();
	}

	toastMessage(text: string): Locator {
		return this.page.getByText(text, { exact: true });
	}
}
