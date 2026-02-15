import { Page, Locator } from "@playwright/test";

interface LoginDTO {
    email: string;
    password: string;
}

export class Loginpage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly registerButton: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.registerButton = page.getByTestId('boton-registrarse');
        this.loginButton = page.getByTestId('boton-login')
    }

    async visitarPaginaLogin() {
        await this.page.goto('http://localhost:3000/login');
        await this.page.waitForLoadState('networkidle');
    }

    async completarFormularioDeLogin({ email, password }: LoginDTO) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }
};



