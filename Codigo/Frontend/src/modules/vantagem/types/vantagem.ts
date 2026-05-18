export type Vantagem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  costInCoins: number;
  isActive: boolean;
  partner: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type CreateVantagemInput = {
  title: string;
  description: string;
  imageUrl?: string;
  costInCoins: number;
};

export type UpdateVantagemInput = Partial<CreateVantagemInput & { isActive: boolean }>;

export type Resgate = {
  id: string;
  code: string;
  coinCost: number;
  advantage: { id: string; title: string; partner: string };
  student: { id: string; name: string };
  createdAt: string;
};
