import { InstitutionEntity } from './institution.entity.js';

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
  // Entity-returning (domain logic)
  findById(id: string): Promise<InstitutionEntity | null>;
  findByUserId(userId: string): Promise<InstitutionEntity | null>;

  // DTO-returning (for API responses)
  findAll(status?: 'PENDING' | 'APPROVED'): Promise<InstitutionData[]>;
  findByIdWithRelations(id: string): Promise<InstitutionData | null>;

  // Commands
  create(name: string): Promise<InstitutionEntity>;
  register(data: RegisterInstitutionData): Promise<{ institution: InstitutionEntity; userEmail: string }>;
  approve(id: string): Promise<{ institution: InstitutionEntity; userEmail: string; userName: string } | null>;
  update(id: string, name: string): Promise<InstitutionEntity | null>;
  updateWithUser(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<InstitutionEntity | null>;
  updateLinkedUser(institutionId: string, data: { name?: string; email?: string }): Promise<void>;
  delete(id: string): Promise<InstitutionEntity | null>;
}
