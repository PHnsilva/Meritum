type PartnerCompany = {
  id: string;
  corporateName: string;
  tradeName: string | null;
  email: string;
  cnpj: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toPartnerCompanyResponse(partnerCompany: PartnerCompany) {
  return {
    id: partnerCompany.id,
    corporateName: partnerCompany.corporateName,
    tradeName: partnerCompany.tradeName,
    email: partnerCompany.email,
    cnpj: partnerCompany.cnpj,
    address: partnerCompany.address,
    createdAt: partnerCompany.createdAt,
    updatedAt: partnerCompany.updatedAt
  };
}

export function toPartnerCompanyListResponse(partnerCompanies: PartnerCompany[]) {
  return partnerCompanies.map(toPartnerCompanyResponse);
}
