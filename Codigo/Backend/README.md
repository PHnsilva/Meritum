# Meritum Backend

API TypeScript/Fastify com Prisma, PostgreSQL, JWT e módulos de cadastros, moedas, vantagens e resgates.

## Execução

Requisitos: Node.js 22.12 ou superior na série 22 e PostgreSQL. RabbitMQ é opcional. A partir da raiz do clone, copie `.env.example` deste diretório para `.env` e preencha os valores.

```bash
cd Codigo/Backend
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Configure `ADMIN_PASSWORD` com um valor não vazio para o seed criar o administrador. Uma conta existente não tem a senha alterada pelo seed. Deixe `RABBITMQ_URL` vazia para desenvolvimento sem broker; se preenchida, a conexão é exigida na inicialização.

## Endereços e contrato

- API: `http://localhost:3333`.
- Health: `GET /health`.
- Swagger: `/docs`.
- Login: `POST /api/auth/login`.
- Recursos: `/api/instituicoes`, `/api/alunos`, `/api/professores`, `/api/parceiros`, `/api/moedas`, `/api/vantagens` e `/api/resgates`.

As antigas rotas `/users` e `/users/login` não estão registradas. Consulte os métodos efetivos no Swagger e nas rotas de cada módulo.

## Configuração e eventos

O [README principal](../../README.md#configuração) detalha banco, JWT, CORS, seed e e-mail. O transporte usa `RABBITMQ_URL`, `RABBITMQ_EXCHANGE` e `RABBITMQ_QUEUE_PREFIX`. Sem broker, os eventos são locais e não duráveis; com broker, há filas duráveis e dead-letter. A publicação não compõe a transação Prisma e não garante entrega única de e-mail.

## Validação

```bash
npm run build
npm run lint
npm test
```

Os testes exigem um PostgreSQL dedicado, com migrações e seed compatível com os helpers. Eles criam dados; não use o banco de produção. Para gerar novas migrações em desenvolvimento, use `npm run prisma:migrate`; para aplicar as versionadas, use `npx prisma migrate deploy`.

As instruções de equipe e a licença estão no [README principal](../../README.md).
