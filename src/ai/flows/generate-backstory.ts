
// src/ai/flows/generate-backstory.ts
'use server';
/**
 * @fileOverview Generates a unique backstory for a space character based on its appearance and name.
 *
 * - generateCharacterBackstory - A function that generates the backstory.
 * - GenerateCharacterBackstoryInput - The input type for the generateCharacterBackstory function.
 * - GenerateCharacterBackstoryOutput - The return type for the generateCharacterBackstory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterBackstoryInputSchema = z.object({
  characterName: z.string().describe('The name of the space character.'),
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

  Skriv en kort bakgrundsberättelse på svenska för en rymdvarelse vid namn {{{characterName}}}.
  Varelsen har följande stil: {{{characterStyle}}}.`,
});

const generateCharacterBackstoryFlow = ai.defineFlow(
  {
    name: 'generateCharacterBackstoryFlow',
    inputSchema: GenerateCharacterBackstoryInputSchema,
    outputSchema: GenerateCharacterBackstoryOutputSchema,
  },
  async input => {
    const result = await prompt(input);
    if (!result.output) {
      console.error(`AI prompt '${prompt.name}' failed to produce output. Input: ${JSON.stringify(input)}. Result details:`, result);
      throw new Error(`AI model ('${prompt.name}') failed to produce valid output. Finish reason: ${result.finishReason}.`);
    }
    return result.output;
  }
);
