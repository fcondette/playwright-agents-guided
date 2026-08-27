import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const email = process.env.TEST_USER_EMAIL ?? "john.doe2@example.com";
const password = process.env.TEST_USER_PASSWORD ?? "Test12345!";

export const test = base.extend<{ authenticatedPage: Page }>({
	authenticatedPage: async ({ page }, use) => {
		await page.goto("/");
		const loginPage = new LoginPage(page);
		await loginPage.login(email, password);
		await expect(page.getByText("Connexion réussie", { exact: true })).toBeVisible();
		await use(page);
	},
});

export { expect };
