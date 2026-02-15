import { Page, Locator } from "@playwright/test";

interface RegisterDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export class RegisterPage {
    readonly page: Page;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly registerButton: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.registerButton = page.getByTestId('boton-registrarse');
        this.loginButton = page.getByTestId('boton-login-header-signup')
    }

    async visitarPaginaRegistrar() {
        await this.page.goto('http://localhost:3000/signup');
        await this.page.waitForLoadState('networkidle');
    }

    async completarFormularioDeRegistro({ firstName, lastName, email, password }: RegisterDTO) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }
};



