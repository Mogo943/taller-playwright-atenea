import { Page, Locator } from "@playwright/test";


export class DashBoardPage {
    readonly page: Page;
    readonly dashBoardTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashBoardTitle = page.getByTestId('titulo-dashboard');
    }

    async visitarDashBoard() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    };
};



