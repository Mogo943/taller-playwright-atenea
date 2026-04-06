import { test as setup, expect } from '@playwright/test';
import { BackendUtils } from '../utils/backendUtils';
import { Loginpage } from '../pages/loginPage';
import TestData from '../data/testData.json';
import { DashBoardPage } from '../pages/dashBoardPage';
import { ModalCreateAccount } from '../pages/modalCreateAccount';
import fs from 'fs/promises';
import path from 'path';

const usuarioEnviaAuthFile = 'playwright/.auth/usuarioEnvia.json';
const usuarioRecibeFile = 'playwright/.auth/usuarioRecibe.json';
const usuarioEnviaDataFile = 'playwright/.auth/usuarioEnvia.data.json';

let loginPage: Loginpage;
let dashBoardPage: DashBoardPage;
let modalCreateAccount: ModalCreateAccount;

let validUser = TestData.usuarioValido;
const { email, ...validUserWithOutemail } = validUser;
let registedUser = TestData.usuarioRegistrado;

setup.beforeEach(async ({ page }) => {
    loginPage = new Loginpage(page);
    dashBoardPage = new DashBoardPage(page);
    modalCreateAccount = new ModalCreateAccount(page);

    await loginPage.visitarPaginaLogin();
});

setup('Generar usuario que envia dinero', async ({ page, request }) => {
    const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

    //Datos del nuevo usuario en cookies para futuros tests de transacciones
    await fs.writeFile(path.resolve(__dirname, '..', usuarioEnviaDataFile), JSON.stringify({ email: emailDinamico, ...validUserWithOutemail }, null, 2));

    await BackendUtils.crearUsuarioPorAPI(request, { email: emailDinamico, ...validUserWithOutemail });
    await loginPage.completarFormularioDeLogin({ email: emailDinamico, password: validUser.password });
    await loginPage.loginButton.click();
    await dashBoardPage.addAccountButton.click();

    await modalCreateAccount.seleccionarTipoDeCuenta('Débito');
    await modalCreateAccount.agregarMonto('1000');
    await modalCreateAccount.createAccountButton.click();
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();

    await page.context().storageState({ path: usuarioEnviaAuthFile });
});

setup('Loguearse con usuario que recibe el dinero', async ({ page }) => {
    await loginPage.completarFormularioDeLogin(registedUser);
    await loginPage.loginButton.click();
    await expect(dashBoardPage.dashBoardTitle).toBeVisible();
    await page.context().storageState({ path: usuarioRecibeFile });
});