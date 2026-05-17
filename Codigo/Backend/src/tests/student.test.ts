import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, getAdminToken, authHeader } from './helpers/app-factory.js';

const ts = Date.now();

describe('Alunos', () => {
  let token: string;
  let institutionId: string;
  let studentId: string;

  beforeAll(async () => {
    token = await getAdminToken();
    const app = await getTestApp();

    const instRes = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(token),
      body: { name: `Inst Aluno ${ts}` }
    });
    institutionId = (JSON.parse(instRes.body) as { id: string }).id;
  });

  afterAll(async () => {
    const app = await getTestApp();
    if (studentId) {
      await app.inject({ method: 'DELETE', url: `/api/alunos/${studentId}`, headers: authHeader(token) });
    }
    if (institutionId) {
      await app.inject({ method: 'DELETE', url: `/api/instituicoes/${institutionId}`, headers: authHeader(token) });
    }
    await closeTestApp();
  });

  it('lista alunos retorna resposta paginada', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/alunos',
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { data: unknown[]; total: number; page: number; limit: number; totalPages: number };
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(body.page).toBe(1);
    expect(body.limit).toBe(50);
  });

  it('cria aluno com sucesso', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/alunos',
      headers: authHeader(token),
      body: {
        name: `Aluno Teste ${ts}`,
        email: `aluno${ts}@test.com`,
        cpf: `${ts}`.padStart(11, '0').slice(-11),
        rg: `RG${ts}`.slice(-9),
        address: 'Rua Teste, 123',
        institutionId,
        course: 'Ciencia da Computacao',
        password: 'senha123'
      }
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body) as { id: string; name: string };
    expect(body.name).toBe(`Aluno Teste ${ts}`);
    studentId = body.id;
  });

  it('instituicao inexistente retorna 404', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/alunos',
      headers: authHeader(token),
      body: {
        name: 'Aluno Invalido',
        email: `inv${ts}@test.com`,
        cpf: `${ts + 1}`.padStart(11, '0').slice(-11),
        rg: `RG${ts + 1}`.slice(-9),
        address: 'Rua Teste, 456',
        institutionId: '00000000-0000-0000-0000-000000000000',
        course: 'Computacao',
        password: 'senha123'
      }
    });
    expect(res.statusCode).toBe(404);
  });

  it('filtra alunos por institutionId', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/api/alunos?institutionId=${institutionId}`,
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { data: Array<{ institution: { id: string } }> };
    expect(body.data.every((a) => a.institution.id === institutionId)).toBe(true);
  });
});
