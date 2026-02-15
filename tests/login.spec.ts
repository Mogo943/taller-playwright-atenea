import { test, expect } from '@playwright/test';
import TestData from '../data/testData.json';
import { Loginpage } from '../pages/loginPage';
import { DashBoardPage } from '../pages/dashBoard';

let loginPage: Loginpage;
let dashBoardPage: DashBoardPage;
let registedUser = TestData.usuarioRegistrado;

test.beforeEach(async ({ page }) => {
    await test.step('Configuración: Iniciar Page Object y navegar', async () => {
        loginPage = new Loginpage(page);
        dashBoardPage = new DashBoardPage(page);
        await loginPage.visitarPaginaLogin();
    });
});

test('TC-7 Validar inicio de seion existoso', async ({ page }) => {
    await test.step('Completar campos del formulario de login', async () => {
        await loginPage.completarFormularioDeLogin(registedUser);
    });

    await test.step('Enviar formulario de login', async () => {
        await loginPage.loginButton.click();
    });

    await test.step('Validar inicio de sesion exitoso', async () => {
        await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
        await expect(dashBoardPage.dashBoardTitle).toBeVisible();
    });
});