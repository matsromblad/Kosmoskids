
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

export const GeneratePlanetActivityInputSchema = z.object({
  planetName: z.string().describe('The name of the planet being visited.'),
  planetDescription: z.string().describe('A short description of the planet.'),
  characterName: z.string().describe('The name of the space character.'),
  characterStyle: z.string().describe('The chosen style for the space character (e.g., Sportig, Nördig).'),
  characterBackstory: z.string().optional().describe('The backstory of the character.'),
  spaceshipName: z.string().optional().describe('The name of the character\'s spaceship.'),
  // spaceshipStyle: z.string().optional().describe('The style of the spaceship.'), // Might be too much detail
});
export type GeneratePlanetActivityInput = z.infer<typeof GeneratePlanetActivityInputSchema>;

export const GeneratePlanetActivityOutputSchema = z.object({
  activityText: z.string().describe("En kort (2-4 meningar), rolig och barnvänlig berättelse på svenska om vad rymdvarelsen {{{characterName}}} gör på planeten {{{planetName}}}. Anpassa berättelsen till karaktärens stil och bakgrund, samt planetens egenskaper."),
  imagePrompt: z.string().describe("En detaljerad prompt för att generera en bild som illustrerar aktiviteten. Bilden ska vara i en glad, färgstark och barnvänlig tecknad stil, och visa {{{characterName}}} på {{{planetName}}}. Inkludera detaljer från berättelsen."),
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
2.  **imagePrompt**: En prompt för att generera en bild till berättelsen. Beskriv scenen, {{{characterName}}}s utseende och handling, samt viktiga element från {{{planetName}}}. Stilen ska vara "glad, färgstark, detaljerad och barnvänlig tecknad stil, rymdtema".

Exempel på output-format (men med anpassat innehåll):
{
  "activityText": "Rymd-Zoe, den äventyrliga utforskaren, landade sitt skepp 'Kometen' mjukt på Lavaplaneten Volcanis. Hon hoppade genast ut och började samla glödande lavastenar, nynnandes på en rymdvisa. En liten Flammis vinkade glatt från en närliggande vulkan!",
  "imagePrompt": "En glad tecknad bild av rymdvarelsen Rymd-Zoe (sportig stil, kanske med coola glasögon) som plockar färgglada, glödande lavastenar på planeten Volcanis. Hennes rymdskepp 'Kometen' syns i bakgrunden. En liten, vänlig, orange Flammis-figur vinkar från en tecknad vulkan. Ljusa färger, detaljerad, barnvänlig rymdillustration."
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
    const {output} = await prompt(input);
    return output!;
  }
);
