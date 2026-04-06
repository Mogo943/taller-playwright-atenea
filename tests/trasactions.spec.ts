import { test, expect } from '@playwright/test';
import { DashBoardPage } from '../pages/dashBoardPage';
import TestData from '../data/testData.json';
import { ModalSendTransfer } from '../pages/modalSendTransfer';
import fs from 'fs/promises';

let registedUser = TestData.usuarioRegistrado;

let dashBoardPage: DashBoardPage;
let modalSendTransfer: ModalSendTransfer;

const testUsuarioEnvia = test.extend({
    storageState: require.resolve('../playwright/.auth/usuarioEnvia.json')
});

const testUsuarioRecibe = test.extend({
    storageState: require.resolve('../playwright/.auth/usuarioRecibe.json')
});

test.beforeEach(async ({ page }) => {
    dashBoardPage = new DashBoardPage(page);
    modalSendTransfer = new ModalSendTransfer(page);
    await dashBoardPage.visitarDashBoard();
})

testUsuarioEnvia('TC-12 Verificar envio de transferencia exitoso', async ({ page }) => {
    await expect(dashBoardPage.dashBoardTitle).toBeVisible();
    await dashBoardPage.sendButton.click();

    await modalSendTransfer.completarFormularioYEnviar(registedUser.email, '100')
    await expect(page.getByText('Transferencia enviada a ' + registedUser.email)).toBeVisible();
});

testUsuarioRecibe('TC-13 Verificar recibo de transferencia exitoso', async ({ page }) => {
    await expect(dashBoardPage.dashBoardTitle).toBeVisible();
    await expect(page.getByText('Transferencia de email').first()).toBeVisible();
});

testUsuarioRecibe('TC-14 verificar en UI transaccion exitosa enviada por API', async ({ page, request }) => {
    const usuarioEnviaData = require.resolve('../playwright/.auth/usuarioEnvia.data.json');
    const usuarioEnviaContenidoData = await fs.readFile(usuarioEnviaData, 'utf-8');
    const datosDeUsuarioEnvia = JSON.parse(usuarioEnviaContenidoData);
    const emailUsuarioEnvia = datosDeUsuarioEnvia.email;

    expect(emailUsuarioEnvia, 'El email del usuario que envia no se leyo correctamente').toBeDefined();

    const usuarioEnviaAuth = require.resolve('../playwright/.auth/usuarioEnvia.json');
    const usuarioEnviaContenidoAuth = await fs.readFile(usuarioEnviaAuth, 'utf-8');
    const datosDeUsuarioEnviaAuth = JSON.parse(usuarioEnviaContenidoAuth);
    const jwtDeUsuarioEnvia = datosDeUsuarioEnviaAuth.origins[0]?.localStorage.find(item => item.name === 'jwt');

    expect(jwtDeUsuarioEnvia, "JWT indefinido").toBeDefined();

    const jwt = jwtDeUsuarioEnvia.value;

    //Obtenemos la cuenta que envia
    const respuestaDeCuentas = await request.get('http://localhost:6007/api/accounts', {
        headers: {
            'Autorization': `Bearer ${jwt}`
        }
    });

    console.log(respuestaDeCuentas)

    expect(respuestaDeCuentas.ok(), 'La API para obtener cuentas fallo').toBeTruthy();
    const cuentas = await respuestaDeCuentas.json();
    expect(cuentas.length, 'El usuario no tiene cuentas').toBeGreaterThan(0);
    const idCuentaOrigen = cuentas[0]._id;

    const montoAleatorio = Math.floor(Math.random() * 100) + 1;

    //Enviar transferencia de una cuenta a otra
    const respuestaDeTransferencia = await request.post('http://localhost:6007/api/transactions/trasnfer', {
        headers: {
            'Autorization': `Bearer ${jwt}`
        },
        data: {
            fromAccountId: idCuentaOrigen,
            toEmail: TestData.usuarioValido.email,
            amount: montoAleatorio,
        },
    });
    expect(respuestaDeTransferencia.ok(), "La API para transferir dinero fallo").toBeTruthy();

});