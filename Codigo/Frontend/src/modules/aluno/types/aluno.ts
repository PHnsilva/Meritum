export type Aluno = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  institution: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateAlunoInput = {
  name: string;
  email: string;
  cpf: string;
  rg: string;
  address: string;
  institutionId: string;
  course: string;
  password: string;
};

export type UpdateAlunoInput = Partial<CreateAlunoInput>;
