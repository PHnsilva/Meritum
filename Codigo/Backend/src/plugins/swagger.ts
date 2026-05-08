import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const swaggerPlugin = fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Meritum API',
        description: 'Documentacao da API do backend Meritum.',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3333',
          description: 'Servidor local'
        }
      ],
      tags: [
        { name: 'Health', description: 'Verificacao de disponibilidade da API' },
        { name: 'Users', description: 'Operacoes de usuarios' },
        { name: 'Instituicoes', description: 'Consulta de instituicoes de ensino' },
        { name: 'Alunos', description: 'Cadastro e manutencao de alunos' },
        { name: 'Parceiros', description: 'Cadastro e manutencao de empresas parceiras' }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });
});
