import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/reigsterPage';
import TestData from '../data/testData.json';

let registerPage: RegisterPage;
let validUser = TestData.usuarioValido;
// Desestructuramos para tener un objeto base sin el email fijo
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