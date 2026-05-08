export type Instituicao = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateInstituicaoInput = {
  name: string;
};

export type UpdateInstituicaoInput = Partial<CreateInstituicaoInput>;
