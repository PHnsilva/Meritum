import { describe, it, expect, afterAll } from 'vitest';
import { getTestApp, closeTestApp, getAdminToken, authHeader } from './helpers/app-factory.js';

describe('Auth', () => {
  afterAll(closeTestApp);

  it('login valido retorna 200 com token e usuario', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'admin@meritum.com', password: 'admin123' }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { token: string; user: { role: string } };
    expect(body.token).toBeDefined();
    expect(body.user.role).toBe('admin');
  });

  it('credenciais invalidas retorna 401', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'admin@meritum.com', password: 'wrong-password' }
    });
    expect(res.statusCode).toBe(401);
  });

  it('rota protegida sem token retorna 401', async () => {
    const app = await getTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/alunos' });
    expect(res.statusCode).toBe(401);
  });

  it('rota protegida com token admin retorna 200', async () => {
    const token = await getAdminToken();
    const app = await getTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/alunos', headers: authHeader(token) });
    expect(res.statusCode).toBe(200);
  });

  it('token invalido retorna 401', async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/alunos',
      headers: { authorization: 'Bearer token-invalido' }
    });
    expect(res.statusCode).toBe(401);
  });

  // RBAC
  it('refresh retorna novo token JWT', async () => {
    const token = await getAdminToken();
    const app = await getTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { token: string };
    expect(body.token).toBeDefined();
    // JWT tem 3 partes separadas por ponto
    expect(body.token.split('.').length).toBe(3);
  });

  it('RBAC: token com role=student nao acessa GET /api/alunos (admin/professor)', async () => {
    const app = await getTestApp();
    // Cria token manualmente com role student
    const studentToken = app.jwt.sign({ sub: 'fake-student-id', role: 'student' });
    const res = await app.inject({
      method: 'GET',
      url: '/api/alunos',
      headers: authHeader(studentToken)
    });
    expect(res.statusCode).toBe(403);
  });

  it('RBAC: token com role=student nao acessa POST /api/instituicoes (admin only)', async () => {
    const app = await getTestApp();
    const studentToken = app.jwt.sign({ sub: 'fake-student-id', role: 'student' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/instituicoes',
      headers: authHeader(studentToken),
      body: { name: 'Inst Proibida' }
    });
    expect(res.statusCode).toBe(403);
  });

  it('RBAC: token com role=professor nao acessa POST /api/moedas/enviar... wait, professor pode', async () => {
    const app = await getTestApp();
    const professorToken = app.jwt.sign({ sub: 'fake-prof-id', role: 'professor' });
    // Professor pode acessar /api/alunos
    const res = await app.inject({
      method: 'GET',
      url: '/api/alunos',
      headers: authHeader(professorToken)
    });
    expect(res.statusCode).toBe(200);
  });

  it('RBAC: token com role=partner nao acessa GET /api/parceiros (admin only)', async () => {
    const app = await getTestApp();
    const partnerToken = app.jwt.sign({ sub: 'fake-partner-id', role: 'partner' });
    const res = await app.inject({
      method: 'GET',
      url: '/api/parceiros',
      headers: authHeader(partnerToken)
    });
    expect(res.statusCode).toBe(403);
  });

  it('RBAC: admin acessa GET /api/instituicoes', async () => {
    const token = await getAdminToken();
    const app = await getTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/instituicoes',
      headers: authHeader(token)
    });
    expect(res.statusCode).toBe(200);
  });
});
