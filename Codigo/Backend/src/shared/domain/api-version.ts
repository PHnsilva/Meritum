/**
 * API Versioning — Support multiple API versions for backward compatibility
 */

export const API_VERSION = 'v1';

export const VERSIONED_ENDPOINTS = {
  // Auth
  'POST /auth/login': 'v1',
  'POST /auth/refresh': 'v1',
  'POST /auth/alterar-senha': 'v1',

  // Students
  'GET /alunos': 'v1',
  'POST /alunos': 'v1',
  'PUT /alunos/:id': 'v1',
  'DELETE /alunos/:id': 'v1',

  // Professors
  'GET /professores': 'v1',
  'POST /professores': 'v1',
  'PUT /professores/:id': 'v1',
  'DELETE /professores/:id': 'v1',

  // Coins
  'POST /moedas/enviar': 'v1',
  'GET /moedas/extrato/professor/:professorId': 'v1',
  'GET /moedas/extrato/aluno/:studentId': 'v1',

  // Advantages
  'GET /vantagens': 'v1',
  'POST /vantagens': 'v1',
  'PUT /vantagens/:id': 'v1',
  'DELETE /vantagens/:id': 'v1',
  'POST /vantagens/:id/resgatar': 'v1',

  // Institution
  'GET /instituicoes': 'v1',
  'POST /instituicoes': 'v1',
  'PUT /instituicoes/:id': 'v1',
  'DELETE /instituicoes/:id': 'v1',

  // Partners
  'GET /parceiros': 'v1',
  'POST /parceiros': 'v1',
  'PUT /parceiros/:id': 'v1',
  'DELETE /parceiros/:id': 'v1'
};

/**
 * Migration Path (when v2 is needed):
 *
 * 1. Add new endpoints under /api/v2/...
 * 2. Keep /api/v1/... working (backward compatibility)
 * 3. Deprecate v1 in 6 months
 * 4. Sunset v1 in 12 months
 *
 * Example:
 * ```ts
 * // v1 (old)
 * app.get('/api/v1/alunos', handler);
 *
 * // v2 (new, with breaking changes)
 * app.get('/api/v2/alunos', newHandler);
 *
 * // User can choose which version to use
 * ```
 */
