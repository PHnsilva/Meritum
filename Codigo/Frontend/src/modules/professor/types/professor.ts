export type Professor = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  department: string;
  coinBalance: number;
  institution: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type CreateProfessorInput = {
  name: string;
  email: string;
  cpf: string;
  department: string;
  institutionId: string;
};

export type UpdateProfessorInput = Partial<CreateProfessorInput>;
