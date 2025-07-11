'use server';

/**
 * @fileOverview Generates a personalized software career roadmap based on user input.
 *
 * - generateRoadmap - A function that generates a software career roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoadmapInputSchema = z.object({
  goal: z.string().describe('The user specified goal or interest.'),
});

export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('The generated software career roadmap.'),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const generateRoadmapPrompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `Given the user's goal: "{{{goal}}}", generate a structured career roadmap including:\n- Qualifications Needed\n- In-Demand Skills\n- Future Trends\n- Step-by-step journey from beginner to job-ready\nFormat the response with clear section titles and bullet points or numbered steps.`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await generateRoadmapPrompt(input);
    return output!;
  }
);
