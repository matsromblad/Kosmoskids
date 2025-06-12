
'use server';
/**
 * @fileOverview Generates a unique backstory for a spaceship based on its style and parts.
 *
 * - generateSpaceshipBackstory - A function that generates the backstory.
 * - GenerateSpaceshipBackstoryInput - The input type for the generateSpaceshipBackstory function.
 * - GenerateSpaceshipBackstoryOutput - The return type for the generateSpaceshipBackstory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpaceshipBackstoryInputSchema = z.object({
  spaceshipStyle: z.string().describe('The chosen style for the spaceship, e.g., Snabb kurir, Tungt lastfartyg.'),
  wingName: z.string().describe('The name of the selected wings.'),
  engineName: z.string().describe('The name of the selected engine.'),
  decorationName: z.string().optional().describe('The name of the selected decoration (if any).'),
});
export type GenerateSpaceshipBackstoryInput = z.infer<
  typeof GenerateSpaceshipBackstoryInputSchema
>;

const GenerateSpaceshipBackstoryOutputSchema = z.object({
  backstory: z
    .string()
    .describe('A short backstory for the spaceship, written in Swedish.'),
});
export type GenerateSpaceshipBackstoryOutput = z.infer<
  typeof GenerateSpaceshipBackstoryOutputSchema
>;

export async function generateSpaceshipBackstory(
  input: GenerateSpaceshipBackstoryInput
): Promise<GenerateSpaceshipBackstoryOutput> {
  return generateSpaceshipBackstoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpaceshipBackstoryPrompt',
  input: {schema: GenerateSpaceshipBackstoryInputSchema},
  output: {schema: GenerateSpaceshipBackstoryOutputSchema},
  prompt: `Du är en kreativ rymdskribent som specialiserar sig på att skapa bakgrundsberättelser för rymdskepp.

  Skriv en kort och spännande bakgrundsberättelse på svenska för ett rymdskepp.
  Skeppets stil är: {{{spaceshipStyle}}}.
  Valda vingar: {{{wingName}}}.
  Vald motor: {{{engineName}}}.
  {{#if decorationName}}Vald dekoration: {{{decorationName}}}.{{/if}}
  Berättelsen ska vara kortfattad, ungefär 2-3 meningar.`,
});

const generateSpaceshipBackstoryFlow = ai.defineFlow(
  {
    name: 'generateSpaceshipBackstoryFlow',
    inputSchema: GenerateSpaceshipBackstoryInputSchema,
    outputSchema: GenerateSpaceshipBackstoryOutputSchema,
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

