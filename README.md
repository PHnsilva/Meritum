# Meritum

Sistema web para reconhecimento de mérito estudantil por meio de uma moeda virtual. A proposta do domínio é permitir que instituições, alunos, professores e empresas parceiras participem de um ecossistema onde moedas podem ser distribuídas por mérito acadêmico e futuramente resgatadas em vantagens.

---

## Status do Projeto

![Status](https://img.shields.io/badge/status-prot%C3%B3tipo%20funcional-007ec6?style=for-the-badge)
![Backend](https://img.shields.io/badge/backend-Fastify%20%2B%20Prisma-111827?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-2563eb?style=for-the-badge)
![Database](https://img.shields.io/badge/database-PostgreSQL-316192?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Modelo de Dados](#modelo-de-dados)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Endpoints da API](#endpoints-da-api)
- [Frontend](#frontend)
- [Telas do Projeto](#telas-do-projeto)
- [Segurança](#segurança)
- [Testes](#testes)
- [Documentação e Artefatos](#documentação-e-artefatos)
- [Troubleshooting](#troubleshooting)
- [Autores](#autores)
- [Licença](#licença)

---

## Visão Geral

O Meritum é composto por duas aplicações separadas:

- **Backend:** API HTTP em Node.js, TypeScript e Fastify, com autenticação JWT, RBAC e documentação Swagger.
- **Frontend:** aplicação SPA em React, TypeScript e Vite, com rotas protegidas e dashboards por perfil.

### Contextos implementados

- Autenticação com JWT (login, refresh token, proteção de rotas).
- Autorização por perfil (RBAC): admin, professor, aluno (student), parceiro (partner).
- Cadastro, listagem paginada, edição, consulta e remoção de instituições.
- Cadastro, listagem paginada, edição, consulta e remoção de alunos.
- Cadastro, listagem paginada, edição, consulta e remoção de professores.
- Cadastro, listagem paginada, edição, consulta e remoção de empresas parceiras.
- Distribuição de moedas por professor a aluno da mesma instituição.
- Extrato de movimentações de moedas (professor e aluno).
- Perfil do usuário com troca de senha (primeiro acesso via link por e-mail).
- Dashboard por perfil (admin, professor, aluno).
- Documentação interativa da API com Swagger UI.
- Rate limiting global e por endpoint sensível.
- Testes de integração automatizados (26 casos com Vitest).

### Contextos previstos para evolução

- Vantagens (catálogo de recompensas por parceiros).
- Resgates de moedas e geração de cupons.
- Validação de cupons por parceiros.

---

## Funcionalidades

| Área | Funcionalidade | Status |
|---|---|---|
| Autenticação | Login por e-mail e senha com JWT | Implementado |
| Autenticação | Refresh token | Implementado |
| Autenticação | Troca de senha no primeiro acesso | Implementado |
| Autenticação | Persistência de sessão no `localStorage` | Implementado |
| RBAC | Autorização por perfil no backend | Implementado |
| Instituições | CRUD completo | Implementado |
| Alunos | CRUD completo com paginação | Implementado |
| Professores | CRUD completo com paginação | Implementado |
| Parceiros | CRUD completo com paginação | Implementado |
| Moedas | Distribuição de professor para aluno | Implementado |
| Moedas | Extrato do professor | Implementado |
| Moedas | Extrato do aluno | Implementado |
| API | Health check | Implementado |
| API | Swagger/OpenAPI | Implementado |
| API | Rate limiting | Implementado |
| UI | Layout principal, menu, dashboard e tema | Implementado |
| UI | Dashboards por perfil (admin, professor, aluno) | Implementado |
| Testes | Testes de integração automatizados (Vitest) | Implementado |
| Vantagens | Catálogo de recompensas | Placeholder |
| Resgates | Baixa de saldo e geração de cupom | Planejado |

---

## Tecnologias

### Backend

- **Node.js**
- **TypeScript**
- **Fastify**
- **@fastify/jwt** — autenticação JWT
- **@fastify/rate-limit** — proteção contra abuso de requisições
- **@fastify/cors**
- **@fastify/swagger** + **@fastify/swagger-ui**
- **Prisma ORM**
- **PostgreSQL**
- **Resend** — envio de e-mail transacional via API HTTP (recomendado; funciona no Render, que bloqueia portas SMTP)
- **Nodemailer** — fallback de envio por SMTP (dev local / hosts sem bloqueio de porta)
- **dotenv**
- **tsx** para desenvolvimento com watch
- **Vitest** para testes de integração

### Frontend

- **React 19**
- **TypeScript**
- **Vite 7**
- **React Router DOM 7**
- **Lucide React** para ícones
- **CSS global customizado** com tema claro/escuro

### Banco de Dados

- **PostgreSQL**
- **Prisma Client**
- **Prisma Migrate**

### Infraestrutura

- **Docker**
- **Docker Compose**

---

## Arquitetura

Os três serviços são orquestrados pelo `docker-compose.yml` na raiz, cada um em seu próprio container e comunicando-se pela rede interna do Compose.

```mermaid
flowchart LR
  U[Usuário] --> F["Frontend React/Vite\ncontainer: frontend"]
  F -->|HTTP/JSON + JWT| B["Backend Fastify\ncontainer: backend"]
  B --> P[Prisma ORM]
  P --> DB[("PostgreSQL\ncontainer: postgres")]
  B --> S[Swagger/OpenAPI]

  subgraph Docker Compose
    F
    B
    P
    DB
  end
```

### Backend

Organizado como **monólito modular** com variação de **ADR (Action-Domain-Responder)**:

- `action/`: camada HTTP — rotas, schemas, RBAC (`preHandler`).
- `application/`: orquestração de casos de uso e acesso ao Prisma.
- `responder/`: montagem dos objetos de resposta.
- `plugins/`: plugins Fastify (Prisma, JWT, Swagger).
- `shared/auth/`: `requireRole()` — fábrica de preHandler RBAC.
- `shared/pagination/`: `paginate()` e `toPaginatedResult()`.
- `tests/`: testes de integração com Vitest.

Fluxo típico:

```txt
Request HTTP
  -> authenticate (JWT)
  -> requireRole (RBAC)
  -> Action / Route
  -> Application Service
  -> Prisma
  -> PostgreSQL
  -> Responder
  -> Response JSON
```

### Frontend

SPA em React organizada por módulos funcionais:

- `app/`: layout, rotas e guards (`ProtectedRoute`, `RoleGuard`, `HomeDashboard`).
- `modules/`: funcionalidades por domínio (`auth`, `aluno`, `professor`, `parceiro`, `instituicao`, `moeda`, `dashboard`).
- `shared/`: componentes, cliente HTTP (com `Authorization: Bearer`), estilos, tipos e utilitários.

---

## Modelo de Dados

O schema Prisma usa **Table Per Type (TPT)**: `User` é a tabela base de identidade; cada perfil tem sua própria tabela com dados específicos.

| Modelo | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Tabela base com credenciais e perfil (`role`). |
| `Institution` | `institutions` | Instituições de ensino. |
| `Student` | `students` | Alunos vinculados a uma instituição. |
| `Professor` | `professors` | Professores vinculados a uma instituição. |
| `PartnerCompany` | `partner_companies` | Empresas parceiras. |
| `CoinTransaction` | `coin_transactions` | Histórico de movimentações de moedas. |

### Relacionamentos

```mermaid
erDiagram
  USER ||--o| STUDENT : "é"
  USER ||--o| PROFESSOR : "é"
  USER ||--o| PARTNER_COMPANY : "é"
  INSTITUTION ||--o{ STUDENT : possui
  INSTITUTION ||--o{ PROFESSOR : possui
  PROFESSOR ||--o{ COIN_TRANSACTION : origina
  STUDENT ||--o{ COIN_TRANSACTION : recebe

  USER {
    string id PK
    string name
    string email UK
    string passwordHash
    string role
    int coinBalance
    bool mustChangePassword
    datetime createdAt
    datetime updatedAt
  }

  INSTITUTION {
    string id PK
    string name UK
    datetime createdAt
    datetime updatedAt
  }

  STUDENT {
    string id PK
    string cpf UK
    string rg UK
    string address
    string course
    string institutionId FK
    datetime createdAt
    datetime updatedAt
  }

  PROFESSOR {
    string id PK
    string cpf UK
    string department
    string institutionId FK
    datetime createdAt
    datetime updatedAt
  }

  PARTNER_COMPANY {
    string id PK
    string corporateName
    string tradeName
    string cnpj UK
    string address
    datetime createdAt
    datetime updatedAt
  }

  COIN_TRANSACTION {
    string id PK
    string professorId FK
    string studentId FK
    int amount
    string motive
    datetime createdAt
  }
```

### Dados iniciais (seed)

O seed cria automaticamente ao iniciar o Docker:

- Usuário admin: `admin@meritum.com` / `admin123`
- Instituições: PUC Minas Campus Lourdes, Coração Eucarístico, Praça da Liberdade

---

## Estrutura de Pastas

```txt
Meritum/
├── docker-compose.yml
├── Artefatos/
│   ├── modelagem/
│   │   ├── casos-de-uso/
│   │   ├── classes/
│   │   ├── componentes/
│   │   ├── diagrama-de-sequencia/
│   │   └── er/
│   └── telas/
├── Codigo/
│   ├── Backend/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── vitest.config.ts
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── seed.ts
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── aluno/
│   │       │   ├── auth/
│   │       │   ├── instituicao/
│   │       │   ├── moeda/
│   │       │   ├── parceiro/
│   │       │   └── professor/
│   │       ├── plugins/
│   │       │   ├── jwt.ts
│   │       │   ├── prisma.ts
│   │       │   └── swagger.ts
│   │       ├── shared/
│   │       │   ├── auth/
│   │       │   │   └── require-role.ts
│   │       │   ├── errors/
│   │       │   └── pagination/
│   │       │       └── pagination.ts
│   │       ├── tests/
│   │       │   ├── helpers/
│   │       │   │   └── app-factory.ts
│   │       │   ├── auth.test.ts
│   │       │   ├── coin.test.ts
│   │       │   ├── institution.test.ts
│   │       │   └── student.test.ts
│   │       ├── app.ts
│   │       └── server.ts
│   └── Frontend/
│       ├── Dockerfile
│       └── src/
│           ├── app/
│           │   ├── layouts/
│           │   └── routes/
│           ├── modules/
│           │   ├── aluno/
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── instituicao/
│           │   ├── moeda/
│           │   ├── parceiro/
│           │   └── professor/
│           └── shared/
│               ├── components/
│               ├── http/
│               └── types/
├── LICENSE
└── README.md
```

---

## Variáveis de Ambiente

### Backend

Arquivo de exemplo: `Codigo/Backend/.env.example`

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/meritum?schema=public"
PORT=3333
HOST="0.0.0.0"
JWT_SECRET="troque-em-producao"
RESEND_API_KEY="re_xxxxxxxxxxxx"
MAIL_FROM="Meritum <onboarding@resend.dev>"
FRONTEND_URL="http://localhost:5173"
```

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL usada pelo Prisma. |
| `PORT` | Não | Porta HTTP do backend. Padrão: `3333`. |
| `HOST` | Não | Host do Fastify. Padrão: `0.0.0.0`. |
| `JWT_SECRET` | Sim | Segredo para assinar tokens JWT. |
| `RESEND_API_KEY` | Não¹ | Chave da API do [Resend](https://resend.com). Provedor de e-mail recomendado (funciona no Render). |
| `MAIL_FROM` | Não | Remetente dos e-mails. Com Resend, use um domínio verificado ou `Meritum <onboarding@resend.dev>` (teste). |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Não¹ | Fallback SMTP (nodemailer), usado só se `RESEND_API_KEY` estiver vazio. Bloqueado no plano free do Render. |
| `SMTP_PORT` | Não | Porta SMTP. Padrão: `587`. |
| `FRONTEND_URL` | Não | URL base do frontend usada nos links de e-mail. |

> ¹ Sem `RESEND_API_KEY` **e** sem credenciais SMTP, o app usa contas de teste **Ethereal**: nenhum e-mail real é entregue, apenas um link de preview é impresso no log.

> **Atenção:** Nunca comite o arquivo `.env` com credenciais reais. O `.gitignore` já o exclui.

### Frontend

Arquivo de exemplo: `Codigo/Frontend/.env.example`

```env
VITE_API_URL=http://localhost:3333
```

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `VITE_API_URL` | Sim | URL base da API consumida pelo frontend. |

---

## Como Rodar Localmente

---

### Opção 1: Docker Compose (recomendada)

#### Pré-requisitos

- Docker e Docker Compose instalados.
- Arquivo `Codigo/Backend/.env` configurado com `JWT_SECRET` (e, opcionalmente, `RESEND_API_KEY` para envio de e-mail).

#### Subir todos os serviços

```bash
docker compose up --build
```

O Compose inicializa o PostgreSQL, aguarda o healthcheck, então sobe o backend (executa migrations + seed) e por fim o frontend.

```txt
Frontend:  http://localhost:5173
Backend:   http://localhost:3333
Swagger:   http://localhost:3333/docs
```

Login inicial: `admin@meritum.com` / `admin123`

Para derrubar os containers:

```bash
docker compose down
```

Para derrubar e remover os volumes (apaga dados do banco):

```bash
docker compose down -v
```

---

### Opção 2: Execução manual

#### Pré-requisitos

- Node.js 20+ e npm.
- PostgreSQL em execução com banco `meritum`, usuário `admin`, senha `admin`.

#### 1. Configurar o backend

```bash
cd Codigo/Backend
cp .env.example .env
# edite .env com JWT_SECRET (e RESEND_API_KEY para envio de e-mail; opcional)
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

#### 2. Configurar o frontend

Em outro terminal:

```bash
cd Codigo/Frontend
cp .env.example .env
npm install
npm run dev
```

---

## Scripts Disponíveis

### Backend

Execute dentro de `Codigo/Backend`.

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia a API em modo desenvolvimento com `tsx watch`. |
| `npm run build` | Compila TypeScript para `dist/`. |
| `npm start` | Executa a API compilada em `dist/server.js`. |
| `npm test` | Executa os testes de integração com Vitest. |
| `npm run test:watch` | Vitest em modo watch. |
| `npm run test:coverage` | Vitest com relatório de cobertura. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa migrations em desenvolvimento. |
| `npm run prisma:seed` | Popula o banco com dados iniciais. |
| `npm run prisma:studio` | Abre o Prisma Studio. |

### Frontend

Execute dentro de `Codigo/Frontend`.

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o Vite em modo desenvolvimento na porta `5173`. |
| `npm run build` | Executa `tsc -b` e gera o build de produção. |
| `npm run preview` | Serve o build localmente na porta `4173`. |

---

## Endpoints da API

Base URL local: `http://localhost:3333`

Documentação interativa: `http://localhost:3333/docs`

Todos os endpoints (exceto `GET /health`, `POST /api/auth/login` e rotas de ativação/troca de senha) exigem o header:

```
Authorization: Bearer <token>
```

### Health

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Verifica disponibilidade da API. |

### Autenticação

| Método | Endpoint | Auth | Perfis | Descrição |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | — | — | Login. Retorna `{ token, user }`. |
| `POST` | `/api/auth/refresh` | JWT | todos | Renova o token JWT. |
| `GET` | `/api/auth/perfil` | JWT | todos | Dados do usuário autenticado. |
| `PUT` | `/api/auth/perfil` | JWT | admin | Atualiza perfil do admin. |
| `POST` | `/api/auth/ativar` | — | — | Ativa conta via token de e-mail. |
| `POST` | `/api/auth/alterar-senha` | — | — | Troca de senha via token de e-mail. |

Exemplo de login:

```json
POST /api/auth/login
{ "email": "admin@meritum.com", "password": "admin123" }
```

Resposta:

```json
{ "token": "<jwt>", "user": { "id": "...", "name": "Admin", "role": "admin", ... } }
```

### Instituições

| Método | Endpoint | Perfis permitidos | Descrição |
|---|---|---|---|
| `GET` | `/api/instituicoes` | todos | Lista instituições. |
| `GET` | `/api/instituicoes/:id` | admin, professor | Consulta por ID. |
| `POST` | `/api/instituicoes` | admin | Cria instituição. |
| `PUT` | `/api/instituicoes/:id` | admin | Atualiza instituição. |
| `DELETE` | `/api/instituicoes/:id` | admin | Remove instituição. |

### Alunos

| Método | Endpoint | Perfis permitidos | Descrição |
|---|---|---|---|
| `GET` | `/api/alunos` | admin, professor | Lista paginada. Query: `?page=1&limit=50&institutionId=`. |
| `GET` | `/api/alunos/:id` | admin, professor, student | Consulta por ID. |
| `POST` | `/api/alunos` | admin | Cria aluno. |
| `PUT` | `/api/alunos/:id` | admin, student | Atualiza aluno. |
| `DELETE` | `/api/alunos/:id` | admin | Remove aluno. |

### Professores

| Método | Endpoint | Perfis permitidos | Descrição |
|---|---|---|---|
| `GET` | `/api/professores` | admin | Lista paginada. Query: `?page=1&limit=50`. |
| `GET` | `/api/professores/:id` | admin, professor | Consulta por ID. |
| `POST` | `/api/professores` | admin | Cria professor (envia e-mail de ativação). |
| `PUT` | `/api/professores/:id` | admin, professor | Atualiza professor. |
| `DELETE` | `/api/professores/:id` | admin | Remove professor. |

### Empresas Parceiras

| Método | Endpoint | Perfis permitidos | Descrição |
|---|---|---|---|
| `GET` | `/api/parceiros` | admin | Lista paginada. Query: `?page=1&limit=50`. |
| `GET` | `/api/parceiros/:id` | admin, partner | Consulta por ID. |
| `POST` | `/api/parceiros` | admin | Cria empresa parceira. |
| `PUT` | `/api/parceiros/:id` | admin, partner | Atualiza empresa parceira. |
| `DELETE` | `/api/parceiros/:id` | admin | Remove empresa parceira. |

### Moedas

| Método | Endpoint | Perfis permitidos | Descrição |
|---|---|---|---|
| `POST` | `/api/moedas/enviar` | professor | Envia moedas para um aluno da mesma instituição. |
| `GET` | `/api/moedas/extrato/professor/:id` | admin, professor | Extrato e saldo do professor. |
| `GET` | `/api/moedas/extrato/aluno/:id` | admin, student | Extrato e saldo do aluno. |

Exemplo de envio de moedas:

```json
POST /api/moedas/enviar
{ "professorId": "...", "studentId": "...", "amount": 50, "motive": "Boa participação" }
```

### Resposta paginada

Endpoints de listagem retornam:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

## Frontend

### Rotas

| Rota | Perfil | Tela |
|---|---|---|
| `/login` | — | Login |
| `/cadastro` | — | Cadastro de parceiro |
| `/ativar-conta` | — | Ativação de conta via e-mail |
| `/alterar-senha` | — | Troca de senha |
| `/` | todos | Dashboard (varia por perfil) |
| `/perfil` | todos | Perfil do usuário |
| `/instituicoes` | admin | Listagem de instituições |
| `/instituicoes/nova` | admin | Cadastro de instituição |
| `/instituicoes/:id/editar` | admin | Edição de instituição |
| `/alunos` | admin | Listagem de alunos |
| `/alunos/novo` | admin | Cadastro de aluno |
| `/alunos/:id/editar` | admin | Edição de aluno |
| `/professores` | admin | Listagem de professores |
| `/professores/novo` | admin | Cadastro de professor |
| `/professores/:id/editar` | admin | Edição de professor |
| `/parceiros` | admin | Listagem de parceiros |
| `/parceiros/novo` | admin | Cadastro de parceiro |
| `/parceiros/:id/editar` | admin | Edição de parceiro |
| `/moedas` | admin, professor | Envio de moedas |
| `/moedas/extrato/professor` | admin, professor | Extrato do professor |
| `/moedas/extrato/aluno` | admin, student | Extrato do aluno |
| `/vantagens` | todos | Placeholder |

### Sessão no frontend

O usuário autenticado (incluindo o token JWT) é armazenado no `localStorage`:

```txt
meritum:user
```

O frontend renova automaticamente o token quando faltam menos de 1 hora para expirar (`refreshIfExpiringSoon`), chamando `POST /api/auth/refresh`.

---

## Telas do Projeto

As telas estão em `Artefatos/telas/`.

| Login | Dashboard Admin |
|---|---|
| ![Login](Artefatos/telas/01-login.png) | ![Dashboard](Artefatos/telas/02-dashboard.png) |

| Instituições | Alunos |
|---|---|
| ![Instituições](Artefatos/telas/03-instituicoes-listagem.png) | ![Alunos](Artefatos/telas/05-alunos-listagem.png) |

---

## Segurança

### Implementado

- Senhas armazenadas com `scryptSync` + salt, verificação com `timingSafeEqual`.
- Autenticação JWT (`@fastify/jwt`), tokens com expiração de 8h.
- Refresh token via `POST /api/auth/refresh`.
- RBAC no backend: cada endpoint declara os perfis autorizados via `requireRole()`.
- Rate limiting global (100 req/min) e reforçado em endpoints sensíveis (login: 10/min, ativar: 5/min, alterar-senha: 10/min).
- Prisma garante unicidade de e-mail, CPF, RG, CNPJ e nome de instituição.
- Respostas da API nunca expõem `passwordHash`.
- CORS habilitado no Fastify.

### Pendências antes de produção

- Restringir Swagger (`/docs`) em produção.
- Adicionar validação real de CPF/CNPJ.
- Usar HTTPS no deploy.
- Configurar CORS com origens explícitas.
- Adicionar logs de auditoria para operações críticas.
- Rotacionar `JWT_SECRET` e a chave do provedor de e-mail (`RESEND_API_KEY` / credenciais SMTP) periodicamente.

---

## Testes

O backend possui 26 testes de integração automatizados com **Vitest**, usando a injeção nativa do Fastify (`app.inject()`) contra um banco de dados real.

```bash
cd Codigo/Backend
npm test
```

### Suítes

| Arquivo | Casos | O que testa |
|---|---|---|
| `auth.test.ts` | 11 | Login válido/inválido, rotas protegidas, refresh token, RBAC por perfil |
| `institution.test.ts` | 5 | CRUD de instituições, duplicata 409, 404 |
| `student.test.ts` | 4 | Listagem paginada, criação, instituição inválida, filtro por instituição |
| `coin.test.ts` | 6 | Saldo insuficiente, instituições diferentes, extrato, 404, admin bloqueado |

### Utilitários de teste

`src/tests/helpers/app-factory.ts` expõe:

- `getTestApp()` — instância Fastify singleton para testes.
- `getAdminToken()` — faz login e retorna token admin.
- `signToken(sub, role)` — assina token JWT com perfil arbitrário para testes de RBAC.
- `authHeader(token)` — retorna `{ authorization: 'Bearer ...' }`.

---

## Documentação e Artefatos

```txt
Artefatos/
├── modelagem/
│   ├── casos-de-uso/
│   │   ├── casos_de_uso_moeda_estudantil.pdf
│   │   └── UML Use Case Diagram.pdf
│   ├── classes/
│   │   └── Diagrama-de-classes.pdf
│   ├── componentes/
│   │   └── UML Component Diagram.png
│   ├── diagrama-de-sequencia/
│   └── er/
│       └── ER Model.png
└── telas/
```

API interativa: `http://localhost:3333/docs`

---

## Troubleshooting

### Containers não sobem

Verifique se as portas `3333`, `5173` e `5432` estão livres. Veja logs de serviço específico:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

Para reconstruir do zero:

```bash
docker compose down -v
docker compose up --build
```

### Backend sobe mas login falha

Verifique se o `JWT_SECRET` está definido no `.env`. O seed precisa ter rodado (`npm run prisma:seed`). Se rodando via Docker, o seed executa automaticamente.

### Erro de conexão com banco (execução manual)

Confirme que `DATABASE_URL` aponta para `localhost:5432` e que o banco `meritum` existe:

```bash
createdb -U admin meritum
```

### Prisma Client não gerado

```bash
cd Codigo/Backend
npm run prisma:generate
```

### Frontend não conecta na API

Verifique `Codigo/Frontend/.env`:

```env
VITE_API_URL=http://localhost:3333
```

### Testes falham com erro de banco

Os testes usam o mesmo banco configurado no `.env`. Certifique-se de que o banco está rodando e as migrations foram aplicadas:

```bash
npm run prisma:migrate
npm test
```

---

## Autores

Projeto desenvolvido em grupo.

| Nome | GitHub | LinkedIn |
|---|---|---|
| Pedro H. S. | <https://github.com/PHnsilva> | <https://www.linkedin.com/in/phnsilva1/> |
| Felipe Parreiras | <https://github.com/FelipeParreiras> | <https://www.linkedin.com/in/felipe-parreiras04/> |
| Gabriel Nonato | <https://github.com/GpNonato> | <https://www.linkedin.com/in/gabriel-nonato-3a3a98376/> |

---

## Licença

Este projeto está sob a licença **MIT**.

Consulte o arquivo [`LICENSE`](LICENSE) para mais detalhes.
