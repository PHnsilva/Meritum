type Institution = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userEmail?: string;
};

export function toInstitutionResponse(institution: Institution) {
  return {
    id: institution.id,
    name: institution.name,
    status: institution.status.toLowerCase(),
    createdAt: institution.createdAt,
    updatedAt: institution.updatedAt,
    ...(institution.userEmail ? { userEmail: institution.userEmail } : {})
  };
}

export function toInstitutionListResponse(institutions: Institution[]) {
  return institutions.map(toInstitutionResponse);
}
