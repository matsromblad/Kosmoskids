
'use server';
/**
 * @fileOverview Generates an image based on a textual prompt, optionally using a base image.
 *
 * - generateImage - A function that calls the image generation flow.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The textual prompt for image generation, describing the scene or subject.'),
  baseImageDataUri: z.string().optional().describe('Optional base image as a data URI to guide the generation (image-to-image). Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

// Admin-anpassningsbar global bildstil. Ändra denna sträng för att påverka stilen på alla genererade bilder.
const GLOBAL_IMAGE_STYLE_PROMPT = "Visuell stil: En glad, färgstark och detaljerad tecknad stil, barnvänlig, för ett rymdäventyr för barn. Generera inga bokstäver eller text i bilden.";


const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const fullPromptText = `${input.prompt.trim()} ${GLOBAL_IMAGE_STYLE_PROMPT}`;
    
    let modelPrompt: string | Array<{text?: string; media?: {url: string}}> = fullPromptText;

    if (input.baseImageDataUri) {
      modelPrompt = [
        { media: { url: input.baseImageDataUri } },
        { text: fullPromptText }
      ];
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: modelPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }
    return { imageDataUri: media.url };
  }
);
