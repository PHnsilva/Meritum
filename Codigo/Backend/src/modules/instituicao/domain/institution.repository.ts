export type InstitutionData = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userEmail?: string;
  userName?: string;
};

export type RegisterInstitutionData = {
  name: string;
  email: string;
  passwordHash: string;
};

export interface InstitutionRepository {
  findAll(status?: 'PENDING' | 'APPROVED'): Promise<InstitutionData[]>;
  findById(id: string): Promise<InstitutionData | null>;
  findByUserId(userId: string): Promise<InstitutionData | null>;
  create(name: string): Promise<InstitutionData>;
  register(data: RegisterInstitutionData): Promise<{ institution: InstitutionData; userEmail: string }>;
  approve(id: string): Promise<{ institution: InstitutionData; userEmail: string; userName: string } | null>;
  update(id: string, name: string): Promise<InstitutionData | null>;
  updateWithUser(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<InstitutionData | null>;
  updateLinkedUser(institutionId: string, data: { name?: string; email?: string }): Promise<void>;
  delete(id: string): Promise<InstitutionData | null>;
}
