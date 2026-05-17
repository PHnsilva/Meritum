-- Migração destrutiva: implementa Table Per Type (herança de Usuario)
-- DROP na ordem correta (dependências primeiro)

DROP TABLE IF EXISTS "transactions";
DROP TABLE IF EXISTS "students";
DROP TABLE IF EXISTS "professors";
DROP TABLE IF EXISTS "partner_companies";
DROP TABLE IF EXISTS "users";

-- Enum role
CREATE TYPE "role" AS ENUM ('STUDENT', 'PROFESSOR', 'PARTNER');

-- Tabela base de usuários (Usuario no diagrama de classes)
CREATE TABLE "users" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "cpf"          TEXT,
    "password_hash" TEXT NOT NULL,
    "role"         "role" NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- Aluno (herda de Usuario via user_id)
CREATE TABLE "students" (
    "id"             TEXT NOT NULL,
    "user_id"        TEXT NOT NULL,
    "rg"             TEXT NOT NULL,
    "address"        TEXT NOT NULL,
    "course"         TEXT NOT NULL,
    "coin_balance"   INTEGER NOT NULL DEFAULT 0,
    "institution_id" TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");
CREATE UNIQUE INDEX "students_rg_key" ON "students"("rg");

-- Professor (herda de Usuario via user_id)
CREATE TABLE "professors" (
    "id"             TEXT NOT NULL,
    "user_id"        TEXT NOT NULL,
    "department"     TEXT NOT NULL,
    "coin_balance"   INTEGER NOT NULL DEFAULT 1000,
    "institution_id" TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "professors_user_id_key" ON "professors"("user_id");

-- EmpresaParceira (herda de Usuario via user_id)
CREATE TABLE "partner_companies" (
    "id"             TEXT NOT NULL,
    "user_id"        TEXT NOT NULL,
    "corporate_name" TEXT NOT NULL,
    "trade_name"     TEXT,
    "cnpj"           TEXT NOT NULL,
    "address"        TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_companies_user_id_key" ON "partner_companies"("user_id");
CREATE UNIQUE INDEX "partner_companies_cnpj_key" ON "partner_companies"("cnpj");

-- Transações
CREATE TABLE "transactions" (
    "id"           TEXT NOT NULL,
    "amount"       INTEGER NOT NULL,
    "motive"       TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "student_id"   TEXT NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_institution_id_fkey"
    FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "professors" ADD CONSTRAINT "professors_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "professors" ADD CONSTRAINT "professors_institution_id_fkey"
    FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "partner_companies" ADD CONSTRAINT "partner_companies_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_professor_id_fkey"
    FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
