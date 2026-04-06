import { APIRequestContext, expect } from '@playwright/test';

export class BackendUtils {

    static async crearUsuarioPorAPI(request: APIRequestContext, usuario: object) {
        const response = await request.post('http://localhost:6007/api/auth/signup', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            data: usuario,
        });
        expect(response.status()).toBe(201);

        return response;
    }
}