type AdvantageWithPartner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  costInCoins: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  partner: {
    id: string;
    corporateName: string;
    tradeName: string | null;
    user: { email: string };
  };
};

type RedemptionWithDetails = {
  id: string;
  code: string;
  coinCost: number;
  createdAt: Date;
  advantage: {
    id: string;
    title: string;
    partner: { corporateName: string };
  };
  student: {
    id: string;
    user: { name: string; email: string };
  };
};

export function toAdvantageResponse(a: AdvantageWithPartner) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    imageUrl: a.imageUrl,
    costInCoins: a.costInCoins,
    isActive: a.isActive,
    partner: {
      id: a.partner.id,
      name: a.partner.tradeName ?? a.partner.corporateName
    },
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  };
}

export function toAdvantageListResponse(list: AdvantageWithPartner[]) {
  return list.map(toAdvantageResponse);
}

export function toRedemptionResponse(r: RedemptionWithDetails) {
  return {
    id: r.id,
    code: r.code,
    coinCost: r.coinCost,
    advantage: { id: r.advantage.id, title: r.advantage.title, partner: r.advantage.partner.corporateName },
    student: { id: r.student.id, name: r.student.user.name },
    createdAt: r.createdAt
  };
}
