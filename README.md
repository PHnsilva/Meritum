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

- **Backend:** API HTTP em Node.js, TypeScript e Fastify.
- **Frontend:** aplicação web em React, TypeScript e Vite.

A API expõe endpoints REST para autenticação simples e operações CRUD. O frontend consome esses endpoints usando `fetch` por meio de um cliente HTTP compartilhado.

### Contextos já implementados

- Cadastro e login de usuário administrativo/protótipo.
- Cadastro, listagem, edição, consulta e remoção de instituições.
- Cadastro, listagem, edição, consulta e remoção de alunos.
- Cadastro, listagem, edição, consulta e remoção de empresas parceiras.
- Dashboard operacional com atalhos para cadastros base.
- Rotas protegidas no frontend com sessão local.
- Documentação interativa da API com Swagger UI.

### Contextos previstos para evolução

- Professores.
- Carteira de moedas.
- Distribuição de moedas.
- Extrato/histórico de movimentações.
- Vantagens.
- Resgates.
- Cupons.
- Validação de cupons por parceiros.
- Autorização por perfil.

---

## Funcionalidades

### Implementadas

| Área | Funcionalidade | Status |
|---|---|---|
| Autenticação | Cadastro de usuário | Implementado |
| Autenticação | Login por e-mail e senha | Implementado |
| Autenticação | Persistência de sessão no `localStorage` | Implementado no frontend |
| Instituições | CRUD de instituições de ensino | Implementado |
| Alunos | CRUD de alunos vinculados a instituições | Implementado |
| Parceiros | CRUD de empresas parceiras | Implementado |
| API | Health check | Implementado |
| API | Swagger/OpenAPI | Implementado |
| UI | Layout principal, menu, dashboard e tema | Implementado |

### Planejadas

| Área | Funcionalidade | Observação |
|---|---|---|
| Professores | Cadastro e gestão | Ainda não implementado |
| Moedas | Saldo, distribuição e movimentações | Ainda não implementado |
| Vantagens | Cadastro e catálogo | Tela placeholder existente |
| Resgates | Baixa de saldo e geração de cupom | Ainda não implementado |
| Perfis | Aluno, professor, parceiro e administrador | Sem RBAC no backend atual |
| Segurança | JWT/sessão robusta e autorização server-side | Necessário antes de produção |
| Testes | Testes unitários, integração e frontend | Ainda não configurado |

---

## Tecnologias

### Backend

- **Node.js**
- **TypeScript**
- **Fastify**
- **@fastify/cors**
- **@fastify/swagger**
- **@fastify/swagger-ui**
- **Prisma ORM**
- **PostgreSQL**
- **dotenv**
- **tsx** para desenvolvimento com watch

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

O projeto segue uma separação clara entre frontend e backend. Os três serviços principais são orquestrados pelo `docker-compose.yml` na raiz do projeto, cada um rodando em seu próprio container isolado e se comunicando pela rede interna do Compose.

```mermaid
flowchart LR
  U[Usuário] --> F["Frontend React/Vite\ncontainer: frontend"]
  F -->|HTTP/JSON| B["Backend Fastify\ncontainer: backend"]
  B --> P[Prisma ORM]
  P --> DB[("PostgreSQL\ncontainer: db")]
  B --> S[Swagger/OpenAPI]

  subgraph Docker Compose
    F
    B
    P
    DB
  end
```

### Backend

O backend está organizado como um **monólito modular** em TypeScript, com separação por contexto de negócio.

A estrutura atual usa uma variação prática de **ADR (Action-Domain-Responder)**:

- `action/`: camada HTTP, definição de rotas, schemas e status codes.
- `application/`: orquestração de casos de uso e acesso ao Prisma.
- `responder/`: montagem dos objetos de resposta da API.
- `shared/`: utilitários compartilhados, como segurança e tratamento de erros Prisma.
- `plugins/`: plugins Fastify, como Prisma e Swagger.

Fluxo típico:

```txt
Request HTTP
  -> Action / Route
  -> Application Service
  -> Prisma
  -> PostgreSQL
  -> Responder
  -> Response JSON
```

### Frontend

O frontend é uma SPA em React, organizada por módulos funcionais:

- `app/`: layout e rotas.
- `modules/`: funcionalidades por domínio.
- `shared/`: componentes, cliente HTTP, estilos, tipos e utilitários.

Fluxo típico:

```txt
Página React
  -> Service do módulo
  -> apiClient
  -> Backend Fastify
  -> Atualização da UI
```

---

## Modelo de Dados

O schema Prisma atual possui quatro modelos principais.

| Modelo | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Usuários administrativos/protótipo usados para login inicial. |
| `Institution` | `institutions` | Instituições de ensino. |
| `Student` | `students` | Alunos vinculados a uma instituição. |
| `PartnerCompany` | `partner_companies` | Empresas parceiras do sistema. |

### Relacionamentos atuais

```mermaid
erDiagram
  INSTITUTION ||--o{ STUDENT : possui

  USER {
    string id PK
    string name
    string email UK
    string passwordHash
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
    string name
    string email UK
    string cpf UK
    string rg UK
    string address
    string course
    string passwordHash
    int coinBalance
    string institutionId FK
    datetime createdAt
    datetime updatedAt
  }

  PARTNER_COMPANY {
    string id PK
    string corporateName
    string tradeName
    string email UK
    string cnpj UK
    string address
    string passwordHash
    datetime createdAt
    datetime updatedAt
  }
```

### Dados iniciais

Existe uma migration que insere instituições iniciais para desenvolvimento:

- PUC Minas - Campus Lourdes
- PUC Minas - Campus Coracao Eucaristico
- PUC Minas - Praca da Liberdade

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
│   │   └── er/
│   └── telas/                        
│       ├── 01-login.png
│       ├── 02-dashboard.png
│       ├── 03-instituicoes-listagem.png
│       ├── 04-instituicoes-formulario.png
│       ├── 05-alunos-listagem.png
│       ├── 06-alunos-formulario.png
│       ├── 07-parceiros-listagem.png
│       ├── 08-parceiros-formulario.png
│       ├── 09-vantagens-placeholder.png
│       └── 10-moedas-placeholder.png
├── Codigo/
│   ├── Backend/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── aluno/
│   │   │   │   ├── instituicao/
│   │   │   │   └── parceiro/
│   │   │   ├── plugins/
│   │   │   ├── routes/
│   │   │   ├── shared/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── Frontend/
│       ├── Dockerfile
│       ├── src/
│       │   ├── app/
│       │   ├── modules/
│       │   │   ├── aluno/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── instituicao/
│       │   │   └── parceiro/
│       │   ├── shared/
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
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
```

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `DATABASE_URL` | Sim | URL de conexão com PostgreSQL usada pelo Prisma. |
| `PORT` | Não | Porta HTTP do backend. Valor padrão: `3333`. |
| `HOST` | Não | Host usado pelo Fastify. Valor padrão: `0.0.0.0`. |

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

O projeto pode ser executado de duas formas: com **Docker Compose** (recomendado) ou manualmente com Node.js e PostgreSQL instalados localmente.

---

### Opção 1: Docker Compose (recomendada)

#### Pré-requisitos

- Docker instalado.
- Docker Compose instalado.

#### Subir todos os serviços

Na raiz do projeto, onde está o `docker-compose.yml`:

```bash
docker compose up --build
```

Isso inicializa em conjunto o banco de dados PostgreSQL, o backend e o frontend.

As aplicações ficam disponíveis em:

```txt
Frontend:  http://localhost:5173
Backend:   http://localhost:3333
Swagger:   http://localhost:3333/docs
```

Para derrubar os containers:

```bash
docker compose down
```

Para derrubar os containers e remover os volumes (apaga os dados do banco):

```bash
docker compose down -v
```

---

### Opção 2: Execução manual

#### Pré-requisitos

- Node.js instalado.
- npm instalado.
- PostgreSQL em execução.
- Banco `meritum` criado localmente.
- Usuário do banco compatível com a `DATABASE_URL` configurada.

Configuração esperada pelo `.env.example` do backend:

```txt
Banco: meritum
Usuário: admin
Senha: admin
Host: localhost
Porta: 5432
Schema: public
```

#### 1. Configurar o backend

```bash
cd Codigo/Backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3333
```

Swagger UI:

```txt
http://localhost:3333/docs
```

Health check:

```txt
http://localhost:3333/health
```

#### 2. Configurar o frontend

Em outro terminal:

```bash
cd Codigo/Frontend
cp .env.example .env
npm install
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:5173
```

---

### Criar usuário inicial

Na tela de login, use a opção **Criar usuário administrativo**.

Também é possível criar via API:

```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@meritum.local",
    "password": "123456"
  }'
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
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa migrations em ambiente de desenvolvimento. |
| `npm run prisma:studio` | Abre o Prisma Studio. |

### Frontend

Execute dentro de `Codigo/Frontend`.

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o Vite em modo desenvolvimento na porta `5173`. |
| `npm run build` | Executa `tsc -b` e gera o build de produção com Vite. |
| `npm run preview` | Serve o build localmente na porta `4173`. |

---

## Endpoints da API

Base URL local:

```txt
http://localhost:3333
```

Documentação interativa:

```txt
http://localhost:3333/docs
```

### Health

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica disponibilidade da API. |

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/users` | Lista usuários cadastrados. |
| `POST` | `/users` | Cria usuário. |
| `POST` | `/users/login` | Autentica usuário por e-mail e senha. |

Exemplo de criação de usuário:

```json
{
  "name": "Admin",
  "email": "admin@meritum.local",
  "password": "123456"
}
```

Exemplo de login:

```json
{
  "email": "admin@meritum.local",
  "password": "123456"
}
```

### Instituições

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/instituicoes` | Lista instituições. |
| `GET` | `/api/instituicoes/:id` | Consulta instituição por ID. |
| `POST` | `/api/instituicoes` | Cria instituição. |
| `PUT` | `/api/instituicoes/:id` | Atualiza instituição. |
| `DELETE` | `/api/instituicoes/:id` | Remove instituição. |

Exemplo:

```json
{
  "name": "PUC Minas - Campus Lourdes"
}
```

### Alunos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/alunos` | Lista alunos. |
| `GET` | `/api/alunos/:id` | Consulta aluno por ID. |
| `POST` | `/api/alunos` | Cria aluno. |
| `PUT` | `/api/alunos/:id` | Atualiza aluno. |
| `DELETE` | `/api/alunos/:id` | Remove aluno. |

Exemplo:

```json
{
  "name": "Maria Silva",
  "email": "maria@aluno.local",
  "cpf": "12345678901",
  "rg": "MG1234567",
  "address": "Rua Exemplo, 100",
  "institutionId": "0d8541f0-6de7-4c12-9f0d-d02f627cb709",
  "course": "Sistemas de Informação",
  "password": "123456"
}
```

### Empresas Parceiras

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/parceiros` | Lista empresas parceiras. |
| `GET` | `/api/parceiros/:id` | Consulta empresa parceira por ID. |
| `POST` | `/api/parceiros` | Cria empresa parceira. |
| `PUT` | `/api/parceiros/:id` | Atualiza empresa parceira. |
| `DELETE` | `/api/parceiros/:id` | Remove empresa parceira. |

Exemplo:

```json
{
  "corporateName": "Empresa Parceira LTDA",
  "tradeName": "Parceira Store",
  "email": "contato@parceira.local",
  "cnpj": "12345678000199",
  "address": "Avenida Exemplo, 200",
  "password": "123456"
}
```

---

## Frontend

### Rotas atuais

| Rota | Tela |
|---|---|
| `/login` | Login e criação de usuário administrativo. |
| `/` | Dashboard operacional. |
| `/instituicoes` | Listagem de instituições. |
| `/instituicoes/nova` | Cadastro de instituição. |
| `/instituicoes/:id/editar` | Edição de instituição. |
| `/alunos` | Listagem de alunos. |
| `/alunos/novo` | Cadastro de aluno. |
| `/alunos/:id/editar` | Edição de aluno. |
| `/parceiros` | Listagem de parceiros. |
| `/parceiros/novo` | Cadastro de parceiro. |
| `/parceiros/:id/editar` | Edição de parceiro. |
| `/vantagens` | Placeholder. |
| `/moedas` | Placeholder. |

### Sessão no frontend

O frontend armazena o usuário autenticado no `localStorage` usando a chave:

```txt
meritum:user
```

A proteção de rotas atual é feita no cliente, verificando se há usuário salvo localmente.

---

## Telas do Projeto

As telas do projeto devem ser documentadas no README por meio de capturas armazenadas em `Artefatos/telas/`.

> Observação: a pasta `Artefatos/telas/` ainda não existe no projeto atual. A estrutura abaixo é a convenção recomendada para versionar as imagens quando as capturas forem adicionadas.

### Pasta prevista para screenshots

```txt
Artefatos/telas/
├── 01-login.png
├── 02-dashboard.png
├── 03-instituicoes-listagem.png
├── 04-instituicoes-formulario.png
├── 05-alunos-listagem.png
├── 06-alunos-formulario.png
├── 07-parceiros-listagem.png
├── 08-parceiros-formulario.png
├── 09-vantagens-placeholder.png
└── 10-moedas-placeholder.png
```

### Mapeamento das telas

| Ordem | Tela | Rota relacionada | Arquivo previsto |
|---:|---|---|---|
| 1 | Login e criação de usuário administrativo | `/login` | `Artefatos/telas/01-login.png` |
| 2 | Dashboard operacional | `/` | `Artefatos/telas/02-dashboard.png` |
| 3 | Listagem de instituições | `/instituicoes` | `Artefatos/telas/03-instituicoes-listagem.png` |
| 4 | Cadastro/edição de instituição | `/instituicoes/nova` e `/instituicoes/:id/editar` | `Artefatos/telas/04-instituicoes-formulario.png` |
| 5 | Listagem de alunos | `/alunos` | `Artefatos/telas/05-alunos-listagem.png` |
| 6 | Cadastro/edição de aluno | `/alunos/novo` e `/alunos/:id/editar` | `Artefatos/telas/06-alunos-formulario.png` |
| 7 | Listagem de parceiros | `/parceiros` | `Artefatos/telas/07-parceiros-listagem.png` |
| 8 | Cadastro/edição de parceiro | `/parceiros/novo` e `/parceiros/:id/editar` | `Artefatos/telas/08-parceiros-formulario.png` |
| 9 | Vantagens | `/vantagens` | `Artefatos/telas/09-vantagens-placeholder.png` |
| 10 | Moedas | `/moedas` | `Artefatos/telas/10-moedas-placeholder.png` |

### Prévia das telas

Quando os arquivos forem adicionados à pasta `Artefatos/telas/`, as imagens abaixo serão renderizadas automaticamente pelo GitHub.

| Login | Dashboard |
|---|---|
| ![Tela de login](Artefatos/telas/01-login.png) | ![Dashboard operacional](Artefatos/telas/02-dashboard.png) |

| Instituições - Listagem | Instituições - Formulário |
|---|---|
| ![Listagem de instituições](Artefatos/telas/03-instituicoes-listagem.png) | ![Formulário de instituição](Artefatos/telas/04-instituicoes-formulario.png) |

| Alunos - Listagem | Alunos - Formulário |
|---|---|
| ![Listagem de alunos](Artefatos/telas/05-alunos-listagem.png) | ![Formulário de aluno](Artefatos/telas/06-alunos-formulario.png) |

| Parceiros - Listagem | Parceiros - Formulário |
|---|---|
| ![Listagem de parceiros](Artefatos/telas/07-parceiros-listagem.png) | ![Formulário de parceiro](Artefatos/telas/08-parceiros-formulario.png) |

| Vantagens | Moedas |
|---|---|
| ![Tela de vantagens](Artefatos/telas/09-vantagens-placeholder.png) | ![Tela de moedas](Artefatos/telas/10-moedas-placeholder.png) |

---

## Segurança

Pontos já existentes:

- Senhas são armazenadas como hash com salt usando `scryptSync` do módulo nativo `node:crypto`.
- Verificação de senha usa `timingSafeEqual`.
- Prisma aplica constraints únicas para e-mail, CPF, RG, CNPJ e nome de instituição.
- O backend evita retornar `passwordHash` nas respostas de usuário, aluno e parceiro.
- CORS está habilitado no Fastify para desenvolvimento.

Limitações atuais:

- Não há JWT, refresh token ou sessão server-side.
- Não há RBAC/autorização por perfil no backend.
- A proteção de rotas do frontend é apenas client-side.
- O endpoint `/users` lista usuários sem autenticação.
- Swagger está exposto sem restrição.
- Não há rate limiting, helmet/security headers ou auditoria de ações.
- Não há validação forte de CPF/CNPJ; atualmente há apenas validações básicas de tamanho e unicidade.

Recomendações antes de produção:

- Implementar autenticação com JWT assinado ou sessão server-side.
- Criar papéis como `ADMIN`, `ALUNO`, `PROFESSOR` e `PARCEIRO`.
- Proteger endpoints por autorização server-side.
- Restringir `/docs` em produção.
- Adicionar rate limiting em login e rotas sensíveis.
- Adicionar validação real de CPF/CNPJ.
- Usar HTTPS no deploy.
- Configurar CORS com origens explícitas.
- Adicionar logs de auditoria para operações críticas.

---

## Testes

Não há scripts de teste configurados nos `package.json` atuais.

Sugestão de estratégia:

### Backend

- Testes unitários para services.
- Testes de integração para rotas Fastify.
- Testes de persistência com banco isolado.
- Testes para erros de unicidade e vínculo entre aluno e instituição.

Ferramentas sugeridas:

- Vitest ou Jest.
- Supertest ou injeção nativa do Fastify.
- Banco PostgreSQL dedicado para testes.

### Frontend

- Testes de componentes.
- Testes de páginas principais.
- Testes de fluxos de formulário.
- Testes de integração com mock da API.

Ferramentas sugeridas:

- Vitest.
- React Testing Library.
- MSW para mock de API.

---

## Documentação e Artefatos

O diretório `Artefatos/` concentra materiais auxiliares do projeto, incluindo modelagem e a pasta prevista para capturas de tela.

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
│   └── er/
│       └── ER Model.png
└── telas/                         
    ├── 01-login.png
    ├── 02-dashboard.png
    ├── 03-instituicoes-listagem.png
    ├── 04-instituicoes-formulario.png
    ├── 05-alunos-listagem.png
    ├── 06-alunos-formulario.png
    ├── 07-parceiros-listagem.png
    ├── 08-parceiros-formulario.png
    ├── 09-vantagens-placeholder.png
    └── 10-moedas-placeholder.png
```

A API também possui documentação interativa gerada no backend:

```txt
http://localhost:3333/docs
```

---

## Troubleshooting

### Erro de conexão com banco (execução manual)

Verifique se o PostgreSQL está em execução e se a `DATABASE_URL` do backend está correta.

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/meritum?schema=public"
```

Também confirme se o banco `meritum` existe.

### Prisma Client não gerado

Execute:

```bash
cd Codigo/Backend
npm run prisma:generate
```

### Tabelas não existem

Execute as migrations:

```bash
cd Codigo/Backend
npm run prisma:migrate
```

### Frontend não conecta na API

Verifique o arquivo `Codigo/Frontend/.env`:

```env
VITE_API_URL=http://localhost:3333
```

Confirme também se o backend está rodando em `http://localhost:3333`.

### Porta em uso

Altere a porta no `.env` do backend:

```env
PORT=3334
```

Depois atualize o frontend:

```env
VITE_API_URL=http://localhost:3334
```

### Build do backend gerado, mas `npm start` falha

Garanta que o build foi executado antes:

```bash
cd Codigo/Backend
npm run build
npm start
```

### Containers Docker não sobem

Verifique se o Docker está em execução e se as portas `3333` e `5173` não estão ocupadas por outros processos. Para verificar logs de um serviço específico:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

Para reconstruir as imagens do zero após mudanças no código:

```bash
docker compose up --build
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
