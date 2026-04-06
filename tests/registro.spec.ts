import { test, expect, request } from '@playwright/test';
import { RegisterPage } from '../pages/reigsterPage';
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';

let registerPage: RegisterPage;
let validUser = TestData.usuarioValido;
const { email, ...validUserWithOutemail } = validUser;

test.beforeEach(async ({ page }) => {
  await test.step('Configuración: Iniciar Page Object y navegar', async () => {
    registerPage = new RegisterPage(page);
    await registerPage.visitarPaginaRegistrar();
  });
});

test('TC-1 Verficacion de elementos visuales en la pagina de registro', async ({ page }) => {
  await test.step('Verificar visibilidad de campos de entrada', async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
  });

  await test.step('Verificar visibilidad de botones de acción', async () => {
    await expect(registerPage.loginButton).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
  });
});

test('TC-2 Verificar boton de registro inhabilitado por defecto', async ({ page }) => {
  await test.step('Validar estado inicial del botón Registrar', async () => {
    await expect(registerPage.registerButton).toBeDisabled();
  });
});

test('TC-3 Verificar boton habilitado luego de llenar formulario', async ({ page }) => {
  await test.step('Llenar formulario con datos completos', async () => {
    await registerPage.completarFormularioDeRegistro(validUser);
  });

  await test.step('Validar que el botón Registrar cambia a habilitado', async () => {
    await expect(registerPage.registerButton).toBeEnabled();
  });
});

test('TC-4 Verificar redireccionamiento a pagina de inicio de sesion al hacer click en iniciar sesion', async ({ page }) => {
  await test.step('Hacer click en el botón "Login"', async () => {
    await registerPage.loginButton.click();
  });

  await test.step('Verificar cambio de URL a /login', async () => {
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});

test('TC-5 Verificar registro exitoso con datos validos', async ({ page }) => {
  // Generamos el email dinámico fuera de los steps para tenerlo disponible en el scope
  const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

  await test.step('Llenar formulario con email único', async () => {
    await registerPage.completarFormularioDeRegistro({ email: emailDinamico, ...validUserWithOutemail });
  });

  await test.step('Enviar formulario de registro', async () => {
    await registerPage.registerButton.click();
  });

  await test.step('Validar mensaje de éxito en pantalla', async () => {
    await expect(page.getByText('Registro exitoso!')).toBeVisible();
  });
});

test('TC-6 Verificar que un usuario no se registre con un usuario ya existente', async ({ page }) => {
  const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

  await test.step('Precondición: Registrar el usuario por primera vez', async () => {
    await registerPage.completarFormularioDeRegistro({ email: emailDinamico, ...validUserWithOutemail });
    await registerPage.registerButton.click();
    // Esperamos un momento o validamos que terminó el primer registro para evitar race conditions
    await expect(page.getByText('Registro exitoso!')).toBeVisible();
  });

  await test.step('Intentar registrar nuevamente el mismo usuario', async () => {
    await registerPage.visitarPaginaRegistrar();
    await registerPage.completarFormularioDeRegistro({ email: emailDinamico, ...validUserWithOutemail });
    await registerPage.registerButton.click();
  });

  await test.step('Validar manejo de error de duplicado', async () => {
    await expect(page.getByText('Email already in use')).toBeVisible();
    await expect(page.getByText('Registro exitoso!')).not.toBeVisible();
  });
});

test('TC-8 Verificar respuesta 201 de la API', async ({ page }) => {
  // Generamos el email dinámico fuera de los steps para tenerlo disponible en el scope
  const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

  await test.step('Llenar formulario con email único', async () => {
    await registerPage.completarFormularioDeRegistro({ email: emailDinamico, ...validUserWithOutemail });
  });

  await test.step('Verificar respuesta de la API', async () => {
    const responsePromise = page.waitForResponse(res =>
      res.url().includes('/api/auth/signup') && res.status() === 201
    );

    await registerPage.registerButton.click();

    const response = await responsePromise;
    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody).toHaveProperty('token');
    expect(typeof responseBody.token).toBe('string');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toEqual(expect.objectContaining({
      id: expect.any(String),
      firstName: TestData.usuarioValido.firstName,
      lastName: TestData.usuarioValido.lastName,
      email: emailDinamico,
    }));

    await expect(page.getByText('Registro exitoso!')).toBeVisible();
  });
});

test('TC-9 Generar singup desde la API', async ({ page, request }) => {
  const emailDinamico = 'usuario2' + Date.now().toString() + '@gmail.com';

  const responseBackend = await BackendUtils.crearUsuarioPorAPI(request, { email: emailDinamico, ...validUserWithOutemail });

  const responseBody = await responseBackend.json();

  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.usuarioValido.firstName,
    lastName: TestData.usuarioValido.lastName,
    email: emailDinamico,
  }));
});

test('TC-10 Verificar comportamientos del front ante un error 500 en el registro', async ({ page, request }) => {
  const emailDinamico = 'carlosmogo94@gmail.com'

  await page.route('**/api/auth/signup', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  });

  await registerPage.completarFormularioDeRegistro({ email: emailDinamico, ...validUserWithOutemail })
  await registerPage.registerButton.click();

  await expect(page.getByText('Error interno')).toBeVisible();
});