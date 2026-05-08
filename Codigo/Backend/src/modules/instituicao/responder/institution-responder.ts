type Institution = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toInstitutionResponse(institution: Institution) {
  return {
    id: institution.id,
    name: institution.name,
    createdAt: institution.createdAt,
    updatedAt: institution.updatedAt
  };
}

export function toInstitutionListResponse(institutions: Institution[]) {
  return institutions.map(toInstitutionResponse);
}
