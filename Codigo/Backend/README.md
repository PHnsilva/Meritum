# Meritum Backend

Backend Node.js configurado com Fastify, Prisma, PostgreSQL e Swagger.

## Stack

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- Swagger/OpenAPI

## Configuracao do banco local

O projeto espera um PostgreSQL local com:

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/meritum?schema=public"
```

Banco: `meritum`
Usuario: `admin`
Senha: `admin`

## Configuracao do RabbitMQ

O RabbitMQ e opcional em desenvolvimento local. Quando `RABBITMQ_URL` estiver
configurada, os eventos de dominio do backend passam pela fila; sem essa variavel,
o backend usa o barramento em memoria.

```env
RABBITMQ_URL="amqp://meritum:meritum@localhost:5672"
RABBITMQ_EXCHANGE="meritum.domain-events"
RABBITMQ_QUEUE_PREFIX="meritum"
```

No `docker-compose.yml` da raiz, o RabbitMQ ja sobe com painel de administracao em
`http://localhost:15672` usando usuario `meritum` e senha `meritum`.
Mensagens que falharem no processamento sao encaminhadas para filas dead-letter
com sufixo `.dead-letter`.

## Instalacao

```bash
npm install
```

## Gerar Prisma Client

```bash
npm run prisma:generate
```

## Criar/aplicar migrations

```bash
npm run prisma:migrate -- --name init
```

## Rodar em desenvolvimento

```bash
npm run dev
```

## URLs

- API: `http://localhost:3333`
- Health check: `http://localhost:3333/health`
- Swagger: `http://localhost:3333/docs`

## Rotas

- `GET /health`
- `GET /users`
- `POST /users`
- `POST /users/login`
- `GET /api/instituicoes`
- `GET /api/instituicoes/:id`
- `POST /api/instituicoes`
- `PUT /api/instituicoes/:id`
- `DELETE /api/instituicoes/:id`
- `GET /api/alunos`
- `GET /api/alunos/:id`
- `POST /api/alunos`
- `PUT /api/alunos/:id`
- `DELETE /api/alunos/:id`
- `GET /api/parceiros`
- `GET /api/parceiros/:id`
- `POST /api/parceiros`
- `PUT /api/parceiros/:id`
- `DELETE /api/parceiros/:id`
