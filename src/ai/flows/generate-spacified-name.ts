
'use server';
/**
 * @fileOverview Generates a "spacified" version of a given name for a space character.
 *
 * - generateSpacifiedCharacterName - A function that generates the spacified name.
 * - GenerateSpacifiedCharacterNameInput - The input type.
 * - GenerateSpacifiedCharacterNameOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpacifiedCharacterNameInputSchema = z.object({
  originalName: z.string().describe('The original name to be "spacified".'),
});
export type GenerateSpacifiedCharacterNameInput = z.infer<
  typeof GenerateSpacifiedCharacterNameInputSchema
>;

const GenerateSpacifiedCharacterNameOutputSchema = z.object({
  spacifiedName: z
    .string()
    .describe('A cool, "spacified" version of the original name, suitable for a space character. Should be in Swedish.'),
});
export type GenerateSpacifiedCharacterNameOutput = z.infer<
  typeof GenerateSpacifiedCharacterNameOutputSchema
>;

export async function generateSpacifiedCharacterName(
  input: GenerateSpacifiedCharacterNameInput
): Promise<GenerateSpacifiedCharacterNameOutput> {
  return generateSpacifiedCharacterNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpacifiedCharacterNamePrompt',
  input: {schema: GenerateSpacifiedCharacterNameInputSchema},
  output: {schema: GenerateSpacifiedCharacterNameOutputSchema},
  prompt: `Du är en kreativ expert på att skapa coola svenska rymdnamn för karaktärer.
Ta följande namn: {{{originalName}}}
Gör om det till ett "rymdifierat" namn. Det kan innebära att lägga till ett prefix (t.ex. Rymd-, Stjärn-, Kosmo-, Nova-), ett suffix, eller en kreativ twist. Namnet ska fortfarande vara igenkännligt från originalet men låta som en rymdvarelse. Svara BARA med det nya namnet.

Exempel:
Original: Lisa -> Rymd-Lisa, Stjärn-Lisa, Lisara Nova
Original: Max -> Kosmo-Max, Maxilar, Max Stjärnvandrare
Original: Anna -> Nova-Anna, Annara X, Galax-Anna

Ge ETT förslag.
`,
});

const generateSpacifiedCharacterNameFlow = ai.defineFlow(
  {
    name: 'generateSpacifiedCharacterNameFlow',
    inputSchema: GenerateSpacifiedCharacterNameInputSchema,
    outputSchema: GenerateSpacifiedCharacterNameOutputSchema,
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
