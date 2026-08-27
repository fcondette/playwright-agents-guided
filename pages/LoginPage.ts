import type { Locator, Page } from "@playwright/test";

export class LoginPage {
	readonly page: Page;
	readonly loginButton: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.loginButton = page.getByTestId("login-button");
		this.emailInput = page.getByTestId("login-email-input");
		this.passwordInput = page.getByTestId("login-password-input");
		this.submitButton = page.getByTestId("login-submit-button");
	}

	async login(email: string, password: string) {
		await this.loginButton.click();
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}
}
