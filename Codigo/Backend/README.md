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
