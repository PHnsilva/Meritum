import type { FastifyInstance } from 'fastify';
import { fetchAgenciaBrasilNews } from '../../../shared/domain/news/news-service.js';

export async function newsRoutes(app: FastifyInstance) {
  app.get('/api/noticias/educacao', async (req, reply) => {
    try {
      const news = await fetchAgenciaBrasilNews();
      reply.send(news);
    } catch (err) {
      console.error('[news-route] Erro:', err);
      reply.status(500).send({ error: 'Falha ao buscar notícias' });
    }
  });
}
