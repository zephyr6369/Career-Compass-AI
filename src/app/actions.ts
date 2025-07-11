'use server';

import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/generate-roadmap';

export async function getRoadmap(
  goal: string
): Promise<{ roadmap: GenerateRoadmapOutput; error?: undefined } | { roadmap: null; error: string }> {
  try {
    if (!goal) {
      return { roadmap: null, error: 'Goal cannot be empty.' };
    }
    const result = await generateRoadmap({ goal });
    return { roadmap: result };
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return { roadmap: null, error: 'Failed to generate roadmap. Please try again later.' };
  }
}
