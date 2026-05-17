type ProfessorRef = {
  id: string;
  department: string;
  user: { name: string; email: string };
};

type StudentRef = {
  id: string;
  course: string;
  user: { name: string; email: string };
};

type TransactionWithRelations = {
  id: string;
  amount: number;
  motive: string;
  createdAt: Date;
  professor?: ProfessorRef | null;
  student?: StudentRef | null;
};

export function toTransactionResponse(tx: TransactionWithRelations) {
  return {
    id: tx.id,
    amount: tx.amount,
    motive: tx.motive,
    createdAt: tx.createdAt,
    ...(tx.professor
      ? { professor: { id: tx.professor.id, name: tx.professor.user.name, email: tx.professor.user.email, department: tx.professor.department } }
      : {}),
    ...(tx.student
      ? { student: { id: tx.student.id, name: tx.student.user.name, email: tx.student.user.email, course: tx.student.course } }
      : {})
  };
}

export function toExtratoResponse(data: {
  coinBalance: number;
  transactions: TransactionWithRelations[];
}) {
  return {
    coinBalance: data.coinBalance,
    transactions: data.transactions.map(toTransactionResponse)
  };
}
