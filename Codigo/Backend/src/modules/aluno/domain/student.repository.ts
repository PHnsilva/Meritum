import { StudentEntity } from './student.entity.js';

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
  // Entity-returning (domain logic)
  findById(id: string): Promise<StudentEntity | null>;

  // DTO-returning (for API responses)
  list(institutionId?: string, skip?: number, take?: number): Promise<StudentReadModel[]>;
  count(institutionId?: string): Promise<number>;
  findByIdWithRelations(id: string): Promise<StudentReadModel | null>;

  // Commands
  create(data: StudentCreateData): Promise<StudentEntity>;
  update(id: string, data: StudentUpdateData): Promise<StudentEntity | null>;
  delete(id: string): Promise<StudentEntity | null>;
}
