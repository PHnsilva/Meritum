import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, getAdminToken, authHeader, signToken } from './helpers/app-factory.js';

const ts = Date.now();

describe('Moedas', () => {
  let adminToken: string;
  let professorToken: string;
  let institutionId: string;
  let professorId: string;
  let studentId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    const app = await getTestApp();

    const instRes = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(adminToken),
      body: { name: `Inst Moeda ${ts}` }
    });
    institutionId = (JSON.parse(instRes.body) as { id: string }).id;

    const profRes = await app.inject({
      method: 'POST',
      url: '/api/professores',
      headers: authHeader(adminToken),
      body: {
        name: `Prof Moeda ${ts}`,
        email: `prof${ts}@test.com`,
        cpf: `${ts + 2}`.padStart(11, '0').slice(-11),
        department: 'Computacao',
        institutionId
      }
    });
    professorId = (JSON.parse(profRes.body) as { id: string }).id;
    professorToken = await signToken(professorId, 'professor');

    const alunoRes = await app.inject({
      method: 'POST',
      url: '/api/alunos',
      headers: authHeader(adminToken),
      body: {
        name: `Aluno Moeda ${ts}`,
        email: `alu${ts}@test.com`,
        cpf: `${ts + 3}`.padStart(11, '0').slice(-11),
        rg: `RG${ts + 3}`.slice(-9),
        address: 'Rua Moeda, 1',
        institutionId,
        course: 'Computacao',
        password: 'senha123'
      }
    });
    studentId = (JSON.parse(alunoRes.body) as { id: string }).id;
  });

  afterAll(async () => {
    const app = await getTestApp();
    if (studentId) await app.inject({ method: 'DELETE', url: `/api/alunos/${studentId}`, headers: authHeader(adminToken) });
    if (professorId) await app.inject({ method: 'DELETE', url: `/api/professores/${professorId}`, headers: authHeader(adminToken) });
    if (institutionId) await app.inject({ method: 'DELETE', url: `/api/instituicoes/${institutionId}`, headers: authHeader(adminToken) });
    await closeTestApp();
  });

  it('professor sem saldo retorna 400', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/moedas/enviar',
      headers: authHeader(professorToken),
      body: { professorId, studentId, amount: 9999, motive: 'Teste' }
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body) as { message: string };
    expect(body.message).toContain('Saldo insuficiente');
  });

  it('professor e aluno de instituicoes diferentes retorna 400', async () => {
    const app = await getTestApp();

    const inst2Res = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(adminToken),
      body: { name: `Inst2 Moeda ${ts}` }
    });
    const inst2Id = (JSON.parse(inst2Res.body) as { id: string }).id;

    const alu2Res = await app.inject({
      method: 'POST',
      url: '/api/alunos',
      headers: authHeader(adminToken),
      body: {
        name: `Aluno2 Moeda ${ts}`,
        email: `alu2${ts}@test.com`,
        cpf: `${ts + 4}`.padStart(11, '0').slice(-11),
        rg: `RG${ts + 4}`.slice(-9),
        address: 'Rua Moeda, 2',
        institutionId: inst2Id,
        course: 'Computacao',
        password: 'senha123'
      }
    });
    const student2Id = (JSON.parse(alu2Res.body) as { id: string }).id;

    const res = await app.inject({
      method: 'POST',
      url: '/api/moedas/enviar',
      headers: authHeader(professorToken),
      body: { professorId, studentId: student2Id, amount: 1, motive: 'Teste' }
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body) as { message: string };
    expect(body.message).toContain('mesma instituicao');

    await app.inject({ method: 'DELETE', url: `/api/alunos/${student2Id}`, headers: authHeader(adminToken) });
    await app.inject({ method: 'DELETE', url: `/api/instituicoes/${inst2Id}`, headers: authHeader(adminToken) });
  });

  it('admin pode ver extrato do professor', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/api/moedas/extrato/professor/${professorId}`,
      headers: authHeader(adminToken)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { coinBalance: number; transactions: unknown[] };
    expect(typeof body.coinBalance).toBe('number');
    expect(Array.isArray(body.transactions)).toBe(true);
  });

  it('admin pode ver extrato do aluno', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/api/moedas/extrato/aluno/${studentId}`,
      headers: authHeader(adminToken)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { coinBalance: number; transactions: unknown[] };
    expect(typeof body.coinBalance).toBe('number');
    expect(Array.isArray(body.transactions)).toBe(true);
  });

  it('professor inexistente no extrato retorna 404', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/moedas/extrato/professor/00000000-0000-0000-0000-000000000000',
      headers: authHeader(adminToken)
    });
    expect(res.statusCode).toBe(404);
  });

  it('admin nao pode enviar moedas (apenas professor)', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/moedas/enviar',
      headers: authHeader(adminToken),
      body: { professorId, studentId, amount: 1, motive: 'Teste' }
    });
    expect(res.statusCode).toBe(403);
  });
});
