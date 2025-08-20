import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string | Timestamp;
  paymentMethod?: 'dinheiro' | 'pix' | 'debito' | 'credito';
  creditCardId?: string;
  installments?: number;
};

export type FamilyMemberIncome = {
  id: string;
  name: string;
  income: number;
};

export type FixedExpense = {
  id: string;
  description: string;
  amount: number;
  category: string;
};

export type ThirdPartyExpense = {
  id: string;
  name: string;
  description: string;
  amount: number;
};

export type CreditCard = {
  id: string;
  name: string;
  closingDate: number;
  dueDate: number;
};

export type Category = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Educação' | 'Lazer' | 'Salário' | 'Renda Extra' | 'Outros';

export type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];
