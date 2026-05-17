import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, getAdminToken, authHeader } from './helpers/app-factory.js';

describe('Instituicoes', () => {
  let token: string;
  let createdId: string;
  const uniqueName = `Test Inst ${Date.now()}`;

  beforeAll(async () => {
    token = await getAdminToken();
  });

  afterAll(async () => {
    if (createdId) {
      const app = await getTestApp();
      await app.inject({
        method: 'DELETE',
        url: `/api/instituicoes/${createdId}`,
        headers: authHeader(token)
      });
    }
    await closeTestApp();
  });

  it('cria instituicao com sucesso', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(token),
      body: { name: uniqueName }
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body) as { id: string; name: string };
    expect(body.name).toBe(uniqueName);
    createdId = body.id;
  });

  it('nome duplicado retorna 409', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(token),
      body: { name: uniqueName }
    });
    expect(res.statusCode).toBe(409);
  });

  it('lista instituicoes retorna array', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/instituicoes',
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('busca por id retorna instituicao', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/api/instituicoes/${createdId}`,
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { name: string };
    expect(body.name).toBe(uniqueName);
  });

  it('id inexistente retorna 404', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/instituicoes/00000000-0000-0000-0000-000000000000',
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(404);
  });
});
