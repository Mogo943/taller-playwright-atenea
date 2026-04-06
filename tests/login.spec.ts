import { test, expect, request } from '@playwright/test';
import TestData from '../data/testData.json';
import { Loginpage } from '../pages/loginPage';
import { DashBoardPage } from '../pages/dashBoardPage';
import { BackendUtils } from '../utils/backendUtils';

let loginPage: Loginpage;
let dashBoardPage: DashBoardPage;
let registedUser = TestData.usuarioRegistrado;
let validUser = TestData.usuarioValido;
const { email, ...validUserWithOutemail } = validUser;

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

test('TC-11 Loguear usuario creado por backend', async ({ page, request }) => {
    const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

    await BackendUtils.crearUsuarioPorAPI(request, { email: emailDinamico, ...validUserWithOutemail });
    await loginPage.completarFormularioDeLogin({ email: emailDinamico, password: validUser.password });
    await loginPage.loginButton.click();

    const responseLogin = await page.waitForResponse('http://localhost:6007/api/auth/login');
    const responseBodyLogin = await responseLogin.json();

    expect(responseLogin.status()).toBe(200);
    expect(responseBodyLogin).toHaveProperty('token');
    expect(typeof responseBodyLogin.token).toBe('string');
    expect(responseBodyLogin).toHaveProperty('user');
    expect(responseBodyLogin.user).toEqual(expect.objectContaining({
        id: expect.any(String),
        firstName: TestData.usuarioValido.firstName,
        lastName: TestData.usuarioValido.lastName,
        email: emailDinamico,
    }));
})