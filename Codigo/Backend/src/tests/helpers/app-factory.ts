import 'dotenv/config';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';

let _app: FastifyInstance | null = null;

export async function getTestApp(): Promise<FastifyInstance> {
  if (!_app) {
    process.env['JWT_SECRET'] = 'test-secret-key';
    _app = await buildApp();
    await _app.ready();
  }
  return _app;
}

export async function closeTestApp(): Promise<void> {
  await _app?.close();
  _app = null;
}

export async function getAdminToken(): Promise<string> {
  const app = await getTestApp();
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    body: { email: 'admin@meritum.com', password: 'admin123' }
  });
  const body = JSON.parse(res.body) as { token: string };
  return body.token;
}

export function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function signToken(sub: string, role: string): Promise<string> {
  const app = await getTestApp();
  return app.jwt.sign({ sub, role });
}
