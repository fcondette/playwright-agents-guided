import type { Locator, Page } from "@playwright/test";

export class ProductsPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	productCard(id: number): Locator {
		return this.page.getByTestId(`product-card-${id}`);
	}

	async openProduct(id: number) {
		await this.productCard(id).click();
	}
}
