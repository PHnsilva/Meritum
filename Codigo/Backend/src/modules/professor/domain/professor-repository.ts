export type ProfessorWithRelations = {
  id: string;
  userId: string;
  department: string;
  coinBalance: number;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export interface ProfessorRepository {
  findAll(): Promise<ProfessorWithRelations[]>;
  findById(id: string): Promise<ProfessorWithRelations | null>;
}
