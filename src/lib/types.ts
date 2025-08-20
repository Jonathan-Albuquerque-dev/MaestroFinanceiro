export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
};

export type Category = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Educação' | 'Lazer' | 'Salário' | 'Renda Extra' | 'Outros';

export type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];
