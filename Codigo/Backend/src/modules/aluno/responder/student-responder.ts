type StudentWithInstitution = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
  institution: {
    id: string;
    name: string;
  };
};

export function toStudentResponse(student: StudentWithInstitution) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    cpf: student.cpf,
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

export function toStudentListResponse(students: StudentWithInstitution[]) {
  return students.map(toStudentResponse);
}
