'use server';

/**
 * @fileOverview Parses a natural language input into a structured data point.
 *
 * - parseDataPoint - A function that parses a data point.
 * - ParseDataPointInput - The input type for the parseDataPoint function.
 * - ParseDataPointOutput - The return type for the parseDataPoint function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ParseDataPointInputSchema = z.object({
  text: z.string().describe('The text to parse into a data point.'),
});
export type ParseDataPointInput = z.infer<typeof ParseDataPointInputSchema>;

const ParseDataPointOutputSchema = z.object({
  type: z.string().describe('The type of data point (e.g., sleep, exercise).'),
  value: z.string().describe('The value of the data point (e.g., 8 hours, 30 minutes).'),
});
export type ParseDataPointOutput = z.infer<typeof ParseDataPointOutputSchema>;

export async function parseDataPoint(input: ParseDataPointInput): Promise<ParseDataPointOutput> {
  return parseDataPointFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseDataPointPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to parse into a data point.'),
    }),
  },
  output: {
    schema: z.object({
      type: z.string().describe('The type of data point (e.g., sleep, exercise).'),
      value: z.string().describe('The value of the data point (e.g., 8 hours, 30 minutes).'),
    }),
  },
  prompt: `You are a data parsing assistant. Your job is to take user provided text and parse it into a structured JSON format with 'type' and 'value' fields.

  Here is the text: {{{text}}}

  Return the data in JSON format.
`,
});

const parseDataPointFlow = ai.defineFlow<
  typeof ParseDataPointInputSchema,
  typeof ParseDataPointOutputSchema
>({
  name: 'parseDataPointFlow',
  inputSchema: ParseDataPointInputSchema,
  outputSchema: ParseDataPointOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
