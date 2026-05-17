type StudentWithRelations = {
  id: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; cpf: string | null; role: string };
  institution: { id: string; name: string };
};

export function toStudentResponse(student: StudentWithRelations) {
  return {
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    cpf: student.user.cpf,
    rg: student.rg,
    address: student.address,
    course: student.course,
    coinBalance: student.coinBalance,
    institution: {
      id: student.institution.id,
      name: student.institution.name
    },
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  };
}

export function toStudentListResponse(students: StudentWithRelations[]) {
  return students.map(toStudentResponse);
}
