
'use server';
/**
 * @fileOverview Generates a unique and witty name for a spaceship.
 *
 * - generateSpaceshipName - A function that generates the spaceship name.
 * - GenerateSpaceshipNameInput - The input type for the generateSpaceshipName function.
 * - GenerateSpaceshipNameOutput - The return type for the generateSpaceshipName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpaceshipNameInputSchema = z.object({
  spaceshipStyle: z.string().describe('The chosen style for the spaceship, e.g., Snabb kurir, Tungt lastfartyg.'),
  wingName: z.string().describe('The name of the selected wings.'),
  engineName: z.string().describe('The name of the selected engine.'),
  decorationName: z.string().optional().describe('The name of the selected decoration (if any).'),
});
export type GenerateSpaceshipNameInput = z.infer<typeof GenerateSpaceshipNameInputSchema>;

const GenerateSpaceshipNameOutputSchema = z.object({
  spaceshipName: z.string().describe('A witty and cool name for the spaceship, written in Swedish.'),
});
export type GenerateSpaceshipNameOutput = z.infer<typeof GenerateSpaceshipNameOutputSchema>;

export async function generateSpaceshipName(
  input: GenerateSpaceshipNameInput
): Promise<GenerateSpaceshipNameOutput> {
  return generateSpaceshipNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpaceshipNamePrompt',
  input: {schema: GenerateSpaceshipNameInputSchema},
  output: {schema: GenerateSpaceshipNameOutputSchema},
  prompt: `Du är en expert på att hitta på coola och fyndiga svenska namn på rymdskepp.
Skeppets stil är: {{{spaceshipStyle}}}.
Valda vingar: {{{wingName}}}.
Vald motor: {{{engineName}}}.
{{#if decorationName}}Vald dekoration: {{{decorationName}}}.{{/if}}
Ge ETT kort, fyndigt och unikt namnförslag för detta skepp. Namnet ska vara på svenska. Svara bara med namnet.`,
});

const generateSpaceshipNameFlow = ai.defineFlow(
  {
    name: 'generateSpaceshipNameFlow',
    inputSchema: GenerateSpaceshipNameInputSchema,
    outputSchema: GenerateSpaceshipNameOutputSchema,
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

