export type Transaction = {
  id: string;
  amount: number;
  motive: string;
  createdAt: string;
  professor?: { id: string; name: string; email: string; department: string };
  student?: { id: string; name: string; email: string; course: string };
};

export type ExtratoResponse = {
  coinBalance: number;
  transactions: Transaction[];
};

export type EnviarMoedasInput = {
  studentId: string;
  amount: number;
  motive: string;
};
