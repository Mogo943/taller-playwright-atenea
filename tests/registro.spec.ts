import { test, expect } from '@playwright/test';

test('TC-1 Verficacion de elementos visuales en la pagina de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
});

test('TC-2 Verificar boton de registro inhabilitado por defecto', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();
});

test('TC-3 Verificar boton habilitado luego de llenar formulario', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.locator('input[name="firstName"]').fill('Nombre1');
  await page.locator('input[name="lastName"]').fill('Apellido2');
  await page.locator('input[name="email"]').fill('usuario2@gmail.com');
  await page.locator('input[name="password"]').fill('Clave123');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-4 Verificar redireccionamiento a pagina de inicio de sesion al hacer click en iniciar sesion', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5 Verificar registro exitoso con datos validos', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.locator('input[name="firstName"]').fill('Nombre1');
  await page.locator('input[name="lastName"]').fill('Apellido1');
  await page.locator('input[name="email"]').fill('usuario2' + Date.now().toString() + '@gmail.com');
  await page.locator('input[name="password"]').fill('Clave123');
  await page.getByTestId('boton-registrarse').click();

  await expect(page.getByText('Registro exitoso!')).toBeVisible();
});

test('TC-6 Verificar que un usuario no se registre con un usuario ya existente', async ({ page }) => {
  const email = 'usuario2' + Date.now().toString() + '@gmail.com';

  await page.goto('http://localhost:3000/signup');
  await page.locator('input[name="firstName"]').fill('Nombre1');
  await page.locator('input[name="lastName"]').fill('Apellido1');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Clave123');
  await page.getByTestId('boton-registrarse').click();

  await page.goto('http://localhost:3000/signup');
  await page.locator('input[name="firstName"]').fill('Nombre1');
  await page.locator('input[name="lastName"]').fill('Apellido1');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Clave123');
  await page.getByTestId('boton-registrarse').click();

  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso!')).not.toBeVisible();
});