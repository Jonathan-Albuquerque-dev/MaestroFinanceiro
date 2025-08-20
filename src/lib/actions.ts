'use server';

import { categorizeExpense } from '@/ai/flows/expense-categorization';
import { getPersonalizedSavingsTips } from '@/ai/flows/personalized-savings-tips';

export async function runCategorizeExpense(description: string) {
  try {
    const result = await categorizeExpense({ description });
    return result;
  } catch (error) {
    console.error("Error categorizing expense:", error);
    return { error: "Não foi possível categorizar a despesa." };
  }
}

export async function runGetSavingsTips(spendingData: string) {
  try {
    const result = await getPersonalizedSavingsTips({ spendingData });
    return result;
  } catch (error) {
    console.error("Error getting savings tips:", error);
    return { error: "Não foi possível gerar as dicas de economia." };
  }
}
