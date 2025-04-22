// The directive tells the Next.js runtime that the code in this file should be executed on the server-side.
'use server';

/**
 * @fileOverview Parses fitness data from natural language input into a structured format.
 *
 * - parseFitnessData - A function that parses fitness data.
 * - ParseFitnessDataInput - The input type for the parseFitnessData function.
 * - ParseFitnessDataOutput - The return type for the parseFitnessData function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ParseFitnessDataInputSchema = z.object({
  workoutText: z.string().describe('The workout data in natural language.'),
});
export type ParseFitnessDataInput = z.infer<typeof ParseFitnessDataInputSchema>;

const ParseFitnessDataOutputSchema = z.object({
  exercise: z.string().describe('The exercise performed.'),
  sets: z.number().describe('The number of sets performed.'),
  reps: z.number().describe('The number of repetitions performed.'),
  weight: z.number().optional().describe('The weight used (if applicable).'),
  unit: z.string().optional().describe('The unit of weight used (if applicable).'),
});
export type ParseFitnessDataOutput = z.infer<typeof ParseFitnessDataOutputSchema>;

export async function parseFitnessData(input: ParseFitnessDataInput): Promise<ParseFitnessDataOutput> {
  return parseFitnessDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseFitnessDataPrompt',
  input: {
    schema: z.object({
      workoutText: z.string().describe('The workout data in natural language.'),
    }),
  },
  output: {
    schema: z.object({
      exercise: z.string().describe('The exercise performed.'),
      sets: z.number().describe('The number of sets performed.'),
      reps: z.number().describe('The number of repetitions performed.'),
      weight: z.number().optional().describe('The weight used (if applicable).'),
      unit: z.string().optional().describe('The unit of weight used (if applicable).'),
    }),
  },
  prompt: `You are a fitness data parsing assistant. Your job is to take user provided workout data in natural language and parse it into a structured JSON format.

  Here is the workout data: {{{workoutText}}}

  Return the data in JSON format. If weight is not provided, omit the weight and unit fields.
`,
});

const parseFitnessDataFlow = ai.defineFlow<
  typeof ParseFitnessDataInputSchema,
  typeof ParseFitnessDataOutputSchema
>({
  name: 'parseFitnessDataFlow',
  inputSchema: ParseFitnessDataInputSchema,
  outputSchema: ParseFitnessDataOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
