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
  qualifications: z.string().describe('A markdown formatted list of qualifications needed.'),
  skills: z.string().describe('A markdown formatted list of in-demand skills.'),
  trends: z.string().describe('A markdown formatted list of future trends.'),
  journey: z.string().describe('A markdown formatted step-by-step journey from beginner to job-ready.'),
  topCompanies: z.string().describe('A markdown formatted list of top tech MNCs that hire for this role, including their estimated salary packages.'),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const generateRoadmapPrompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career advisor. Given the user's goal: "{{{goal}}}", generate a structured career roadmap.

  For each section (qualifications, skills, trends, journey), provide a detailed list formatted in markdown.

  - For "qualifications", list the typical degrees, certifications, and other qualifications needed.
  - For "skills", list the key technical and soft skills that are in demand.
  - For "trends", describe the future outlook and emerging trends in this field.
  - For "journey", provide a clear, step-by-step path for a beginner to become job-ready.
  - For "topCompanies", list major tech companies hiring for this role and provide estimated salary ranges (e.g., for junior, mid, senior levels).`,
  model: 'googleai/gemini-1.5-flash-latest',
  config: {
    temperature: 0.5,
  }
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await generateRoadmapPrompt(input);

    if (!output) {
      throw new Error('Failed to generate roadmap. The model returned no output.');
    }
    return output;
  }
);
