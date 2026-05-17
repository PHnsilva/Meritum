type ProfessorWithRelations = {
  id: string;
  department: string;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export function toProfessorResponse(professor: ProfessorWithRelations) {
  return {
    id: professor.id,
    name: professor.user.name,
    email: professor.user.email,
    cpf: professor.user.cpf,
    department: professor.department,
    coinBalance: professor.coinBalance,
    institution: {
      id: professor.institution.id,
      name: professor.institution.name
    },
    createdAt: professor.createdAt,
    updatedAt: professor.updatedAt
  };
}

export function toProfessorListResponse(professors: ProfessorWithRelations[]) {
  return professors.map(toProfessorResponse);
}
