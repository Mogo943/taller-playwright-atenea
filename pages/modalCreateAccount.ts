import { Page, Locator } from "@playwright/test";


export class ModalCreateAccount {
    readonly page: Page;
    readonly typeAccountDropdown: Locator;
    readonly amountInput: Locator;
    readonly cancelButton: Locator;
    readonly createAccountButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.typeAccountDropdown = page.getByRole('combobox', { name: 'Tipo de cuenta *' })
        this.amountInput = page.getByRole('spinbutton', { name: 'Monto inicial *' });
        this.cancelButton = page.getByTestId('boton-cancelar-crear-cuenta');
        this.createAccountButton = page.getByTestId('boton-crear-cuenta');
    }

    async seleccionarTipoDeCuenta(tipoDeCuenta: string) {
        await this.typeAccountDropdown.click();
        await this.page.getByRole('option', { name: tipoDeCuenta }).click();
    }

    async agregarMonto(monto: string) {
        await this.amountInput.fill(monto);
    }
};



