import { Page, Locator } from "@playwright/test";

export class ModalSendTransfer {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly amountInput: Locator;
    readonly originAccount: Locator;
    readonly cancelButton: Locator;
    readonly sendButton: Locator;
    readonly originAccountOption: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Email del destinatario *' });
        this.originAccount = page.getByRole('combobox', { name: 'Cuenta origen *' });
        this.amountInput = page.getByRole('spinbutton', { name: 'Monto a enviar *' });
        this.cancelButton = page.getByRole('button', { name: 'Cancelar' })
        this.sendButton = page.getByRole('button', { name: 'Enviar' })
        this.originAccountOption = page.getByRole('option', { name: '•••• ' });
    };

    async completarFormularioYEnviar(email: string, amount: string) {
        await this.emailInput.fill(email);
        await this.originAccount.click();
        await this.originAccountOption.click();
        await this.amountInput.fill(amount);
        await this.sendButton.click();
    }

};



