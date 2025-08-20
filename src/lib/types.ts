import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string | Timestamp;
};

export type FamilyMemberIncome = {
  id: string;
  name: string;
  income: number;
};

export type Category = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Educação' | 'Lazer' | 'Salário' | 'Renda Extra' | 'Outros';

export type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];
