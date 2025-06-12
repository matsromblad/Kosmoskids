
'use server';
/**
 * @fileOverview Generates a story and image prompt for a character's activity on a planet.
 *
 * - generatePlanetActivity - A function that generates the activity.
 * - GeneratePlanetActivityInput - The input type for the generatePlanetActivity function.
 * - GeneratePlanetActivityOutput - The return type for the generatePlanetActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlanetActivityInputSchema = z.object({
  planetName: z.string().describe('The name of the planet being visited.'),
  planetDescription: z.string().describe('A short description of the planet.'),
  characterName: z.string().describe('The name of the space character.'),
  characterStyle: z.string().describe('The chosen style for the space character (e.g., Sportig, Nördig).'),
  characterBackstory: z.string().optional().describe('The backstory of the character.'),
  spaceshipName: z.string().optional().describe('The name of the character\'s spaceship.'),
});
export type GeneratePlanetActivityInput = z.infer<typeof GeneratePlanetActivityInputSchema>;

const GeneratePlanetActivityOutputSchema = z.object({
  activityText: z.string().describe("En kort (2-4 meningar), rolig och barnvänlig berättelse på svenska om vad rymdvarelsen {{{characterName}}} gör på planeten {{{planetName}}}. Anpassa berättelsen till karaktärens stil och bakgrund, samt planetens egenskaper."),
  imagePrompt: z.string().describe("En detaljerad BESKRIVNING AV SCENEN för att generera en bild som illustrerar aktiviteten. Bilden ska visa {{{characterName}}} på {{{planetName}}}. Inkludera detaljer från berättelsen. SPECIFICERA INTE BILDSTIL, det hanteras separat."),
});
export type GeneratePlanetActivityOutput = z.infer<typeof GeneratePlanetActivityOutputSchema>;

export async function generatePlanetActivity(
  input: GeneratePlanetActivityInput
): Promise<GeneratePlanetActivityOutput> {
  return generatePlanetActivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlanetActivityPrompt',
  input: {schema: GeneratePlanetActivityInputSchema},
  output: {schema: GeneratePlanetActivityOutputSchema},
  prompt: `Du är en kreativ barnboksförfattare för spelet Kosmoskids.
Din uppgift är att skriva en kort, engagerande och barnvänlig berättelse (2-4 meningar) på svenska om rymdvarelsen {{{characterName}}} när hen besöker planeten {{{planetName}}}.

Här är information om besöket:
Planet: {{{planetName}}}
Beskrivning av planeten: {{{planetDescription}}}

Rymdvarelse: {{{characterName}}}
Stil: {{{characterStyle}}}
{{#if characterBackstory}}Bakgrund: {{{characterBackstory}}}{{/if}}
{{#if spaceshipName}}Reser med skeppet: {{{spaceshipName}}}{{/if}}

Baserat på detta, skapa:
1.  **activityText**: En berättelse om vad {{{characterName}}} gör på {{{planetName}}}. Gör det lekfullt och spännande! Inkludera gärna något som relaterar till karaktärens stil eller bakgrund.
2.  **imagePrompt**: En prompt som ENDAST beskriver scenen för en bild till berättelsen. Beskriv {{{characterName}}}s utseende och handling, samt viktiga element från {{{planetName}}}. Specificera INTE någon konstnärlig stil (t.ex. "tecknad stil", "färgstark") i denna prompt, då det hanteras separat. Fokusera på VAD som ska visas.

Exempel på output-format (men med anpassat innehåll):
{
  "activityText": "Rymd-Zoe, den äventyrliga utforskaren, landade sitt skepp 'Kometen' mjukt på Lavaplaneten Volcanis. Hon hoppade genast ut och började samla glödande lavastenar, nynnandes på en rymdvisa. En liten Flammis vinkade glatt från en närliggande vulkan!",
  "imagePrompt": "Rymdvarelsen Rymd-Zoe (sportig stil, kanske med coola glasögon) plockar färgglada, glödande lavastenar på planeten Volcanis. Hennes rymdskepp 'Kometen' syns i bakgrunden. En liten, vänlig, orange Flammis-figur vinkar från en vulkan."
}
`,
});

const generatePlanetActivityFlow = ai.defineFlow(
  {
    name: 'generatePlanetActivityFlow',
    inputSchema: GeneratePlanetActivityInputSchema,
    outputSchema: GeneratePlanetActivityOutputSchema,
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
