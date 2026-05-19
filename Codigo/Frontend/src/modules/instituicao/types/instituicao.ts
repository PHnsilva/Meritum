export type Instituicao = {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
};

export type CreateInstituicaoInput = { name: string };
export type RegisterInstituicaoInput = { name: string; email: string; password: string };
export type UpdateInstituicaoInput = Partial<{ name: string; email: string; password: string }>;
