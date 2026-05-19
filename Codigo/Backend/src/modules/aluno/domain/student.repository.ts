export type StudentReadModel = {
  id: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export type StudentCreateData = {
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
  rg: string;
  address: string;
  course: string;
  institutionId: string;
};

export type StudentUpdateData = Partial<{
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
  rg: string;
  address: string;
  course: string;
  institutionId: string;
}>;

export interface StudentRepository {
  list(institutionId?: string, skip?: number, take?: number): Promise<StudentReadModel[]>;
  count(institutionId?: string): Promise<number>;
  findById(id: string): Promise<StudentReadModel | null>;
  create(data: StudentCreateData): Promise<StudentReadModel>;
  update(id: string, data: StudentUpdateData): Promise<StudentReadModel | null>;
  delete(id: string): Promise<StudentReadModel | null>;
}
