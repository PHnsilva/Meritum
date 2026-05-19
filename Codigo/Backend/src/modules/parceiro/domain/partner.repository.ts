import type { PartnerEntity } from './partner.entity.js';

export type PartnerReadModel = {
  id: string;
  corporateName: string;
  tradeName: string | null;
  cnpj: string;
  address: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; role: string };
};

export type CreatePartnerData = {
  corporateName: string;
  tradeName?: string;
  email: string;
  cnpj: string;
  address: string;
  passwordHash: string;
  status: 'PENDING' | 'APPROVED';
};

export type UpdatePartnerData = Partial<{
  corporateName: string;
  tradeName: string;
  cnpj: string;
  address: string;
  email: string;
  passwordHash: string;
}>;

export interface PartnerRepository {
  /** Lightweight entity — for domain checks (status, ownership). */
  findById(id: string): Promise<PartnerEntity | null>;
  /** Full read model with user data — for API responses. */
  findByIdFull(id: string): Promise<PartnerReadModel | null>;

  // DTO-returning (for API responses)
  list(filter?: { status?: 'PENDING' | 'APPROVED' }, skip?: number, take?: number): Promise<PartnerReadModel[]>;
  count(filter?: { status?: 'PENDING' | 'APPROVED' }): Promise<number>;

  // Commands (return Entity for domain logic)
  create(data: CreatePartnerData): Promise<PartnerEntity>;
  approve(id: string): Promise<PartnerEntity>;
  update(id: string, data: UpdatePartnerData): Promise<PartnerEntity | null>;
  delete(id: string): Promise<PartnerEntity | null>;
}
