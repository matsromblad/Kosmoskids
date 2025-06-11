// src/ai/flows/generate-backstory.ts
'use server';
/**
 * @fileOverview Generates a unique backstory for a space character based on its appearance.
 *
 * - generateCharacterBackstory - A function that generates the backstory.
 * - GenerateCharacterBackstoryInput - The input type for the generateCharacterBackstory function.
 * - GenerateCharacterBackstoryOutput - The return type for the generateCharacterBackstory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterBackstoryInputSchema = z.object({
  characterStyle: z
    .string()
    .describe('The chosen style for the space character, e.g., sporty, nerdy, cute.'),
});
export type GenerateCharacterBackstoryInput = z.infer<
  typeof GenerateCharacterBackstoryInputSchema
>;

const GenerateCharacterBackstoryOutputSchema = z.object({
  backstory: z
    .string()
    .describe('A short backstory for the space character, written in Swedish.'),
});
export type GenerateCharacterBackstoryOutput = z.infer<
  typeof GenerateCharacterBackstoryOutputSchema
>;

export async function generateCharacterBackstory(
  input: GenerateCharacterBackstoryInput
): Promise<GenerateCharacterBackstoryOutput> {
  return generateCharacterBackstoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterBackstoryPrompt',
  input: {schema: GenerateCharacterBackstoryInputSchema},
  output: {schema: GenerateCharacterBackstoryOutputSchema},
  prompt: `Du är en kreativ författare som specialiserar sig på att skapa bakgrundsberättelser för rymdvarelser.

  Baserat på rymdvarelsens stil, skriv en kort bakgrundsberättelse på svenska.

Rymdvarelsens stil: {{{characterStyle}}}`,
});

const generateCharacterBackstoryFlow = ai.defineFlow(
  {
    name: 'generateCharacterBackstoryFlow',
    inputSchema: GenerateCharacterBackstoryInputSchema,
    outputSchema: GenerateCharacterBackstoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
