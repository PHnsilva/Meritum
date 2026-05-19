export type UserWithRelations = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  student?: { id: string; coinBalance: number } | null;
  professor?: { id: string; coinBalance: number } | null;
  partnerCompany?: { id: string; status: string } | null;
  institution?: { id: string; status: string } | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export interface UserRepository {
  findByEmail(email: string): Promise<UserWithRelations | null>;
  findById(id: string): Promise<UserProfile | null>;
  updatePassword(id: string, hash: string, mustChangePassword?: boolean): Promise<void>;
  updateProfile(id: string, data: { name?: string; email?: string }): Promise<void>;
}
