# Meritum

Sistema voltado ao reconhecimento de mérito estudantil por meio de uma moeda virtual distribuída por professores e resgatada por alunos em vantagens oferecidas por empresas parceiras.

O projeto ainda está em definição técnica em alguns pontos importantes. Neste momento, o que já está **fixado** é a direção arquitetural do **backend**:

- **ADR** na borda;
- **Monólito modular** como arquitetura geral do backend;
- **DDD pragmático** na modelagem do domínio.

Já os seguintes pontos permanecem **em aberto**:

- framework/backend específico;
- stack do frontend;
- banco de dados;
- estratégia final de autenticação;
- ferramenta de build;
- estratégia de deploy.

---

## 🚧 Status do Projeto
![Status](https://img.shields.io/badge/status-em%20defini%C3%A7%C3%A3o-007ec6?style=for-the-badge)
![Backend](https://img.shields.io/badge/backend-em%20defini%C3%A7%C3%A3o-007ec6?style=for-the-badge)
![Arquitetura](https://img.shields.io/badge/arquitetura-ADR%20%7C%20Mon%C3%B3lito%20Modular%20%7C%20DDD-007ec6?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-provavelmente%20separado-007ec6?style=for-the-badge)
![Database](https://img.shields.io/badge/database-em%20defini%C3%A7%C3%A3o-007ec6?style=for-the-badge)
![Build](https://img.shields.io/badge/build-em%20defini%C3%A7%C3%A3o-007ec6?style=for-the-badge)

---

## 📚 Índice
- [Deploy](#-deploy)
- [Apresentação do Sistema](#-apresentação-do-sistema)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Build e Testes](#-build-e-testes)
- [Rotas e Endpoints Principais](#-rotas-e-endpoints-principais)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Fluxos Principais](#-fluxos-principais)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Documentação Técnica](#-documentação-técnica)
- [Troubleshooting](#-troubleshooting)
- [Autores](#-autores)
- [Licença](#-licença)

---

## 🚀 Deploy
- **Aplicação publicada:** em definição
- **Modelo de deploy:** em definição
- **Infraestrutura alvo:** em definição
.

---

## 📝 Sobre o Projeto
O **Meritum** centraliza o fluxo de cadastro, autenticação, distribuição, consulta e resgate de moedas estudantis.

No domínio do sistema:
- professores recebem saldo periódico de moedas;
- alunos acompanham saldo e extrato;
- alunos resgatam vantagens;
- empresas parceiras cadastram ofertas e validam cupons;
- instituições de ensino organizam o contexto acadêmico do sistema.

Embora a arquitetura do **backend** já tenha uma direção definida, a implementação técnica ainda está em aberto. Hoje, a expectativa mais provável é:

- **backend separado do frontend**;
- **frontend em repositório/pasta própria ou aplicação própria**, dependendo da decisão final do grupo;
- **API HTTP** como meio principal de comunicação entre front e back.

Ou seja, diferentemente de uma solução fullstack já fechada, o projeto ainda está em fase de consolidação tecnológica.

---

## ✨ Funcionalidades

### Funcionalidades principais
- cadastro de aluno com vínculo a instituição de ensino;
- autenticação de usuários;
- consulta de saldo e extrato de moedas;
- distribuição de moedas por professores para alunos;
- registro do motivo obrigatório da distribuição;
- crédito semestral acumulável para professores;
- cadastro e manutenção de vantagens por empresas parceiras;
- resgate de vantagens com baixa automática no saldo;
- geração de cupom com código de conferência;
- notificação ao aluno e ao parceiro após resgate;
- consulta de histórico de resgates e movimentações.

### Funcionalidades por contexto operacional
- **Aluno:** cadastra-se, acessa o sistema, consulta saldo/extrato, lista vantagens, realiza resgates e acompanha cupons gerados.
- **Professor:** autentica-se, consulta saldo disponível, distribui moedas para alunos e consulta seu histórico de transferências.
- **Empresa Parceira:** cadastra vantagens, consulta catálogo próprio e acompanha/valida resgates.
- **Instituição de Ensino:** participa do vínculo estrutural entre alunos e professores, permitindo organizar o contexto acadêmico do sistema.

### Recursos técnicos previstos
- backend organizado em módulos por contexto de negócio;
- separação clara entre entrada, aplicação, domínio e infraestrutura no backend;
- frontend desacoplado do backend;
- API HTTP para integração entre as camadas;
- persistência relacional ou não relacional ainda em definição;
- mecanismo de notificação ainda em definição;
- autenticação e autorização ainda em definição.

---

## 🛠 Tecnologias

## Estado atual das decisões técnicas

### Definido
- **Arquitetura do backend:** ADR + Monólito Modular + DDD pragmático
- **Separação entre frontend e backend:**
- **Linguagem principal do backend:** Java

### Em definição
- **Framework do backend:** ainda não definido
- **Framework/lib do frontend:** ainda não definido
- **Banco de dados:** ainda não definido
- **ORM ou estratégia de persistência:** ainda não definida
- **Ferramenta de build:** ainda não definida
- **Tecnologia de autenticação:** ainda não definida
- **Tecnologia de documentação da API:** ainda não definida
- **Estratégia de containerização:** ainda não definida

### Possibilidades em análise
#### Backend
- Micronaut
- Quarkus
- Jakarta EE
- outra opção compatível com Java e com a arquitetura definida

#### Frontend
- frontend separado em aplicação própria
- frontend web tradicional desacoplado do backend
- possibilidade de SPA, MPA ou abordagem híbrida

#### Banco de dados
- PostgreSQL
- MySQL / MariaDB
- outro banco relacional
- eventual avaliação de solução não relacional, se fizer sentido

> Neste momento, o README deve ser lido como **arquiteturalmente definido**, mas **tecnologicamente parcial**.

---

## 🏗️ Arquitetura

### Visão Geral
O projeto adota no **backend** uma arquitetura baseada em:

- **ADR** na borda da aplicação;
- **Monólito modular** como estrutura principal;
- **DDD pragmático** na modelagem do domínio.

O frontend, por sua vez, **não está previsto para ficar necessariamente dentro do mesmo backend**. A tendência atual é que ele seja separado e consuma o backend por API.

### Estilo arquitetural adotado no backend

#### 1. ADR na borda da aplicação
A entrada HTTP do backend é organizada no padrão **ADR (Action-Domain-Responder)**:

- **Action**: recebe a requisição e delega;
- **Application/Domain**: executa o caso de uso e aplica regras;
- **Responder**: monta a resposta da operação.

A intenção é evitar controladores grandes e deixar cada fluxo principal mais explícito.

#### 2. Monólito modular como arquitetura geral do backend
O backend será estruturado como um **monólito modular**, com divisão por contexto funcional.

Módulos previstos:
- `auth`
- `aluno`
- `professor`
- `parceiro`
- `vantagem`
- `resgate`
- `instituicao`
- `shared`

#### 3. DDD pragmático no domínio
O domínio será modelado com foco em:

- linguagem do negócio refletida nas classes;
- entidades com comportamento relevante;
- separação por contexto real de negócio;
- regras concentradas no domínio e não na borda.

Conceitos centrais previstos:
- `Aluno`
- `Professor`
- `Carteira`
- `Transacao`
- `Vantagem`
- `ResgateVantagem`
- `Cupom`
- `InstituicaoEnsino`
- `EmpresaParceira`

### Papel do frontend na solução
Como o frontend provavelmente será separado, a divisão mais provável será:

- **Frontend:** interface do usuário, estado de tela, navegação, validações de UX
- **Backend:** regras de negócio, autenticação/autorização, persistência, integração e API

Essa decisão ainda não está totalmente fechada, então o README evita fixar framework, build ou pasta final do frontend.

### Organização por domínio no backend
- `auth` → autenticação e identificação do usuário
- `aluno` → cadastro, perfil, extrato e resgates do aluno
- `professor` → distribuição de moedas e histórico do professor
- `parceiro` → empresas parceiras e conferência de cupons
- `vantagem` → catálogo e gestão das vantagens
- `resgate` → baixa de saldo, criação e ciclo de vida do resgate
- `instituicao` → vínculo entre alunos, professores e instituição
- `shared` → segurança, exceções, notificações e componentes compartilhados

### Organização interna dos módulos do backend
Cada módulo tende a seguir a divisão:

- `action/` → entrada HTTP
- `application/` → orquestração de casos de uso
- `domain/` → entidades, agregados, value objects e regras
- `responder/` → resposta HTTP/API
- `infrastructure/` → persistência e serviços técnicos

### Fluxo esperado
#### Fluxo principal com frontend separado
`Frontend -> API HTTP -> Action -> Application -> Domain / Repository -> Banco -> Responder -> JSON/HTTP`

#### Fluxo interno do backend
`Action -> Application Service -> Domain -> Repository -> Infraestrutura`

### Limites atuais da arquitetura
Já existe uma direção arquitetural forte, mas ainda faltam decisões sobre:

- framework definitivo do backend;
- modelo final do frontend;
- mecanismo de autenticação;
- banco de dados;
- estratégia de deploy e observabilidade.

---

## 🖼️ Apresentação do Sistema
`docs/apresentacao/telas/`

### Estrutura de pastas das telas
```txt
/docs/apresentacao/
├── telas/
│   ├── 01-landing/                 # Tela inicial e navegação principal
│   │   └── landing.png
│   ├── 02-autenticacao/            # Login e cadastro
│   │   ├── login.png
│   │   └── cadastro-aluno.png
│   ├── 03-aluno/                   # Fluxos do aluno
│   │   ├── dashboard.png
│   │   ├── extrato.png
│   │   ├── vantagens.png
│   │   └── resgates.png
│   ├── 04-professor/               # Fluxos do professor
│   │   ├── dashboard.png
│   │   ├── distribuir-moedas.png
│   │   └── extrato.png
│   └── 05-parceiro/                # Fluxos da empresa parceira
│       ├── dashboard.png
│       ├── cadastrar-vantagem.png
│       └── validar-cupom.png
```

#### Landing page
![Landing page](docs/apresentacao/telas/01-landing/landing.png)

#### Login
![Tela de login](docs/apresentacao/telas/02-autenticacao/login.png)

#### Cadastro do aluno
![Cadastro do aluno](docs/apresentacao/telas/02-autenticacao/cadastro-aluno.png)

#### Dashboard do aluno
![Dashboard do aluno](docs/apresentacao/telas/03-aluno/dashboard.png)

#### Extrato do aluno
![Extrato do aluno](docs/apresentacao/telas/03-aluno/extrato.png)

#### Vantagens disponíveis
![Vantagens disponíveis](docs/apresentacao/telas/03-aluno/vantagens.png)

#### Resgates do aluno
![Resgates do aluno](docs/apresentacao/telas/03-aluno/resgates.png)

#### Dashboard do professor
![Dashboard do professor](docs/apresentacao/telas/04-professor/dashboard.png)

#### Distribuição de moedas
![Distribuição de moedas](docs/apresentacao/telas/04-professor/distribuir-moedas.png)

#### Dashboard do parceiro
![Dashboard do parceiro](docs/apresentacao/telas/05-parceiro/dashboard.png)

---

## 🔐 Variáveis de Ambiente
Como framework, banco e infraestrutura ainda não foram fechados, **as variáveis abaixo são apenas previstas**, não definitivas.

| Variável | Obrigatória | Descrição | Status |
|---|---|---|---|
| `APP_PORT` | Não | Porta HTTP do backend | em definição |
| `DB_URL` | Não | URL de conexão com o banco | em definição |
| `DB_USERNAME` | Não | Usuário do banco | em definição |
| `DB_PASSWORD` | Não | Senha do banco | em definição |
| `DB_DRIVER` | Não | Driver/conector | em definição |
| `MAIL_HOST` | Não | Serviço de e-mail/notificação | em definição |
| `MAIL_PORT` | Não | Porta do serviço de e-mail | em definição |
| `MAIL_USERNAME` | Não | Usuário do serviço | em definição |
| `MAIL_PASSWORD` | Não | Credencial/token | em definição |
| `AUTH_SECRET` | Não | Segredo/chave de autenticação | em definição |

> Esta seção deverá ser refinada quando a stack final do backend e do banco for oficialmente escolhida.

---

## ▶️ Como Rodar Localmente
Como a stack ainda não foi totalmente definida, o passo a passo final de execução também permanece em aberto.

### Pré-requisitos previstos
- **Java** para o backend
- ambiente de execução do **frontend** ainda em definição
- banco de dados ainda em definição
- containerização opcional, ainda em definição

### Cenário mais provável
- subir o backend localmente;
- subir o frontend separado localmente;
- apontar o frontend para a URL da API do backend;
- configurar um banco local ou remoto de desenvolvimento.

### Endereços úteis esperados
- frontend: em definição
- backend/API: em definição
- documentação da API: em definição

---

## 🧱 Build e Testes

### Build
Ainda em definição, pois depende do framework/backend e da stack do frontend.

### Testes previstos
- testes de domínio para regras de carteira e resgate;
- testes de aplicação para distribuição de moedas;
- testes de integração da API;
- testes do frontend conforme stack escolhida.

### Observação
Quando a stack for fechada, esta seção deve ser atualizada com:
- comandos de build do backend;
- comandos de build do frontend;
- comandos de testes automatizados;
- eventualmente Docker / Compose, se forem adotados.

---

## 🔌 Rotas e Endpoints Principais
As rotas abaixo são **previstas**, não definitivas. Elas representam o desenho funcional esperado do backend.

### API prevista
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | autentica usuário |
| `POST` | `/api/auth/logout` | encerra a sessão |
| `GET` | `/api/auth/me` | retorna usuário autenticado |
| `POST` | `/api/alunos` | cadastra aluno |
| `GET` | `/api/alunos/{id}/extrato` | extrato do aluno |
| `GET` | `/api/professores/{id}/extrato` | extrato do professor |
| `POST` | `/api/professores/{id}/distribuicoes` | distribui moedas |
| `GET` | `/api/vantagens` | lista vantagens disponíveis |
| `POST` | `/api/vantagens/{id}/resgates` | resgata vantagem |
| `POST` | `/api/parceiros/{id}/vantagens` | cadastra vantagem |
| `GET` | `/api/parceiros/{id}/vantagens` | lista vantagens do parceiro |

> O desenho final da API pode mudar conforme decisões de autenticação, frontend e framework.

---

## 👥 Perfis de Acesso
| Perfil | Papel no sistema | Acessos típicos |
|---|---|---|
| `ALUNO` | usuário final que acumula e resgata moedas | dashboard, extrato, vantagens, resgates |
| `PROFESSOR` | distribui moedas e acompanha saldo/histórico | distribuição, extrato, saldo |
| `PARCEIRO` | mantém vantagens e valida cupons | cadastro de vantagem, listagem, conferência |

---

## 🔄 Fluxos Principais

### 1. Cadastro e autenticação do aluno
1. o usuário acessa a interface;
2. informa seus dados e seleciona a instituição;
3. o backend valida e persiste o aluno;
4. após autenticação, o sistema identifica o usuário;
5. o frontend passa a operar com a sessão/token definido futuramente.

### 2. Distribuição de moedas pelo professor
1. o professor acessa a área de distribuição;
2. informa aluno, quantidade e motivo;
3. a aplicação verifica saldo disponível;
4. o professor é debitado e o aluno creditado;
5. a transação é registrada e o aluno é notificado.

### 3. Resgate de vantagem pelo aluno
1. o aluno acessa o catálogo de vantagens;
2. escolhe a vantagem desejada;
3. a aplicação verifica saldo suficiente;
4. o saldo é debitado e um resgate é criado;
5. um cupom é gerado e notificado ao aluno e ao parceiro.

### 4. Gestão de vantagens pela empresa parceira
1. a empresa parceira acessa seu painel;
2. cadastra ou atualiza vantagens;
3. consulta ofertas já publicadas;
4. acompanha resgates e valida cupons.

---

## 📁 Estrutura de Pastas
A estrutura abaixo representa a **direção mais provável**, não um layout final já congelado.

```txt
MERITUM/
├── backend/                                # Backend principal
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/meritum/
│   │   │   │       ├── auth/              # Autenticação
│   │   │   │       │   ├── action/
│   │   │   │       │   ├── application/
│   │   │   │       │   ├── domain/
│   │   │   │       │   ├── responder/
│   │   │   │       │   └── infrastructure/
│   │   │   │       ├── aluno/             # Contexto do aluno
│   │   │   │       ├── professor/         # Contexto do professor
│   │   │   │       ├── parceiro/          # Contexto do parceiro
│   │   │   │       ├── vantagem/          # Vantagens
│   │   │   │       ├── resgate/           # Resgates e cupons
│   │   │   │       ├── instituicao/       # Instituições
│   │   │   │       ├── shared/            # Componentes compartilhados
│   │   │   │       └── config/            # Configurações técnicas
│   │   │   └── resources/                 # Recursos do backend
│   │   └── test/                          # Testes do backend
│   └── README.md                          # Documentação do backend, se necessário
├── frontend/                               # Frontend provável, ainda em definição
│   ├── src/
│   ├── public/
│   └── README.md
├── docs/                                   # Diagramas, requisitos e apresentação
│   ├── apresentacao/
│   ├── diagramas/
│   └── requisitos/
├── .gitignore
├── LICENSE
└── README.md
```

### Leitura rápida da estrutura
- `backend/` → regras de negócio e API
- `frontend/` → interface do usuário, se a separação for confirmada
- `docs/` → documentação técnica e artefatos

---

## 📖 Documentação Técnica
- diagramas de caso de uso;
- diagramas de classes;
- diagramas de componentes;
- diagramas de pacotes;
- documentação de requisitos;
- definição futura da API.

### Itens ainda pendentes de documentação técnica
- framework definitivo do backend;
- stack definitiva do frontend;
- banco de dados;
- modelo final de autenticação;
- estratégia de deploy;
- observabilidade/logging.

---

## 🧯 Troubleshooting
Como a stack ainda não foi fechada, esta seção também é preliminar.

### Problemas já esperados para futura atenção
- configuração de conexão com banco;
- alinhamento entre frontend e backend;
- autenticação entre aplicações separadas;
- CORS ou política de comunicação entre front e back;
- envio de notificações;
- configuração de ambiente local.

> Esta seção deve ser refinada assim que framework, banco e frontend forem oficialmente definidos.

---

## 👥 Autores

Projeto desenvolvido em grupo.

| Nome | GitHub | LinkedIn |
|------|--------|----------|
| Pedro H. S. | https://github.com/PHnsilva | https://www.linkedin.com/in/phnsilva1/ |
| Felipe Parreiras | https://github.com/FelipeParreiras | https://www.linkedin.com/in/felipe-parreiras04/ |
| Gabriel Nonato | https://github.com/GpNonato | https://www.linkedin.com/in/gabriel-nonato-3a3a98376/ |

---

## 📄 Licença
Este projeto está sob a licença **MIT**.  
Consulte o arquivo `LICENSE` para mais detalhes.
