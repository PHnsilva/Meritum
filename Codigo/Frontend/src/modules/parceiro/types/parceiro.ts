export type Parceiro = {
  id: string;
  corporateName: string;
  tradeName: string | null;
  email: string;
  cnpj: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateParceiroInput = {
  corporateName: string;
  tradeName?: string;
  email: string;
  cnpj: string;
  address: string;
  password: string;
};

export type UpdateParceiroInput = Partial<CreateParceiroInput>;
