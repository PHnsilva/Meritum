export type StudentWithRelations = {
  id: string;
  userId: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export interface StudentRepository {
  findAll(institutionId?: string): Promise<StudentWithRelations[]>;
  findById(id: string): Promise<StudentWithRelations | null>;
}
