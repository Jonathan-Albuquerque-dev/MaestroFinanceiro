'use server';

/**
 * @fileOverview This file contains the Genkit flow for providing personalized savings tips based on user spending habits.
 *
 * - getPersonalizedSavingsTips - A function that returns personalized savings tips.
 * - PersonalizedSavingsTipsInput - The input type for the getPersonalizedSavingsTips function.
 * - PersonalizedSavingsTipsOutput - The return type for the getPersonalizedSavingsTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedSavingsTipsInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A detailed summary of the users spending habits, including categories, amounts, and frequency.'
    ),
});
export type PersonalizedSavingsTipsInput = z.infer<typeof PersonalizedSavingsTipsInputSchema>;

const PersonalizedSavingsTipsOutputSchema = z.object({
  savingsTips: z
    .array(z.string())
    .describe(
      'A list of personalized savings tips based on the users spending habits.'
    ),
});
export type PersonalizedSavingsTipsOutput = z.infer<typeof PersonalizedSavingsTipsOutputSchema>;

export async function getPersonalizedSavingsTips(
  input: PersonalizedSavingsTipsInput
): Promise<PersonalizedSavingsTipsOutput> {
  return personalizedSavingsTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedSavingsTipsPrompt',
  input: {schema: PersonalizedSavingsTipsInputSchema},
  output: {schema: PersonalizedSavingsTipsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending data and provide personalized savings tips.

Spending Data: {{{spendingData}}}

Based on this spending data, provide a list of specific and actionable savings tips.`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const personalizedSavingsTipsFlow = ai.defineFlow(
  {
    name: 'personalizedSavingsTipsFlow',
    inputSchema: PersonalizedSavingsTipsInputSchema,
    outputSchema: PersonalizedSavingsTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
