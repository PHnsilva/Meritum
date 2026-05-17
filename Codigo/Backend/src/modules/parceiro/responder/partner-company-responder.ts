type PartnerCompanyWithUser = {
  id: string;
  corporateName: string;
  tradeName: string | null;
  cnpj: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; role: string };
};

export function toPartnerCompanyResponse(partnerCompany: PartnerCompanyWithUser) {
  return {
    id: partnerCompany.id,
    corporateName: partnerCompany.corporateName,
    tradeName: partnerCompany.tradeName,
    email: partnerCompany.user.email,
    cnpj: partnerCompany.cnpj,
    address: partnerCompany.address,
    createdAt: partnerCompany.createdAt,
    updatedAt: partnerCompany.updatedAt
  };
}

export function toPartnerCompanyListResponse(partnerCompanies: PartnerCompanyWithUser[]) {
  return partnerCompanies.map(toPartnerCompanyResponse);
}
