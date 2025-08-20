import type { Transaction } from './types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    description: 'Salário Mensal',
    amount: 5000,
    category: 'Salário',
    date: new Date(new Date().setDate(1)).toISOString(),
  },
  {
    id: '2',
    type: 'expense',
    description: 'Aluguel',
    amount: 1500,
    category: 'Moradia',
    date: new Date(new Date().setDate(5)).toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    description: 'Supermercado',
    amount: 600,
    category: 'Alimentação',
    date: new Date(new Date().setDate(10)).toISOString(),
  },
  {
    id: '4',
    type: 'expense',
    description: 'Conta de Internet',
    amount: 100,
    category: 'Moradia',
    date: new Date(new Date().setDate(12)).toISOString(),
  },
  {
    id: '5',
    type: 'expense',
    description: 'Uber para o trabalho',
    amount: 120,
    category: 'Transporte',
    date: new Date(new Date().setDate(15)).toISOString(),
  },
  {
    id: '6',
    type: 'income',
    description: 'Freelance Website',
    amount: 800,
    category: 'Renda Extra',
    date: new Date(new Date().setDate(18)).toISOString(),
  },
  {
    id: '7',
    type: 'expense',
    description: 'Jantar com amigos',
    amount: 150,
    category: 'Lazer',
    date: new Date(new Date().setDate(20)).toISOString(),
  },
  {
    id: '8',
    type: 'expense',
    description: 'Academia',
    amount: 90,
    category: 'Saúde',
    date: new Date(new Date().setDate(22)).toISOString(),
  },
];

export const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Salário',
    'Renda Extra',
    'Outros'
];
