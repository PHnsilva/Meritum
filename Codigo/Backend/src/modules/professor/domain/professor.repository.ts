export type ProfessorReadModel = {
  id: string;
  department: string;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export type ProfessorCreateData = {
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
  mustChangePassword: boolean;
  department: string;
  institutionId: string;
};

export type ProfessorUpdateData = Partial<{
  name: string;
  email: string;
  cpf: string;
  department: string;
  institutionId: string;
}>;

export type ActivationUserView = {
  id: string;
  name: string;
  email: string;
};

export interface ProfessorRepository {
  list(skip?: number, take?: number, institutionId?: string): Promise<ProfessorReadModel[]>;
  count(institutionId?: string): Promise<number>;
  findById(id: string): Promise<ProfessorReadModel | null>;
  create(data: ProfessorCreateData): Promise<ProfessorReadModel>;
  update(id: string, data: ProfessorUpdateData): Promise<ProfessorReadModel | null>;
  delete(id: string): Promise<ProfessorReadModel | null>;
  findActivationUser(email: string): Promise<ActivationUserView | null>;
  setTemporaryPassword(userId: string, hash: string): Promise<void>;
}
