/**
 * Schemas JSON compartilhados pelas rotas Fastify.
 *
 * Antes, cada arquivo de rotas redeclarava os mesmos schemas de erro,
 * mensagem e paginação. Centralizá-los garante consistência nas
 * respostas documentadas no Swagger e elimina a duplicação.
 */

/** Corpo padrão de respostas de erro (4xx/5xx). */
export const errorSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

/** Corpo padrão de respostas informativas com mensagem. */
export const messageSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

/**
 * Envelope de paginação padrão (espelha PaginatedResult<T> de shared/pagination).
 * Recebe o schema dos itens e devolve o schema do envelope completo.
 */
export function paginatedSchema<TItems>(itemsSchema: TItems) {
  return {
    type: 'object',
    properties: {
      data: { type: 'array', items: itemsSchema },
      total: { type: 'integer' },
      page: { type: 'integer' },
      limit: { type: 'integer' },
      totalPages: { type: 'integer' }
    }
  } as const;
}
