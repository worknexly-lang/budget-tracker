
'use server';
/**
 * @fileOverview An AI flow to analyze an EMI statement and extract loan details.
 *
 * - analyzeEmiStatement - A function that handles the EMI statement analysis process.
 * - EmiAnalysisInput - The input type for the analyzeEmiStatement function.
 * - EmiAnalysis - The return type for the analyzeEmiStatement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmiAnalysisInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A PDF or Excel file of a loan statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EmiAnalysisInput = z.infer<typeof EmiAnalysisInputSchema>;

const EmiAnalysisSchema = z.object({
  loanName: z.string().describe('The name of the loan or the lender.'),
  totalAmount: z.number().describe('The total principal amount of the loan.'),
  emiAmount: z.number().describe('The amount of the Equated Monthly Installment (EMI).'),
  interestRate: z.number().optional().describe('The annual interest rate, if available.'),
  tenure: z.number().describe('The total tenure of the loan in months.'),
  emisPaid: z.number().describe('The number of EMIs already paid.'),
  emisPending: z.number().describe('The number of EMIs remaining to be paid.'),
  nextDueDate: z.string().describe('The due date of the next EMI in YYYY-MM-DD format.'),
  status: z.enum(['On Track', 'Delayed']).describe('The current status of the loan payments.'),
  lastUpdated: z.string().optional().describe('The date the EMI was last marked as paid in ISO format.'),
});
export type EmiAnalysis = z.infer<typeof EmiAnalysisSchema>;

export async function analyzeEmiStatement(input: EmiAnalysisInput): Promise<EmiAnalysis> {
  return analyzeEmiStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmiStatementPrompt',
  input: {schema: EmiAnalysisInputSchema},
  output: {schema: EmiAnalysisSchema},
  prompt: `You are an expert financial analyst. Your task is to analyze the provided loan statement (PDF or Excel) and extract key details about the loan. 
  
  The user has provided the following document:
  {{media url=fileDataUri}}

  Carefully parse the document and extract the following information:
  - Loan Name or Lender
  - Total Loan Amount (Principal)
  - EMI Amount
  - Annual Interest Rate (if explicitly mentioned)
  - Total Loan Tenure (in months)
  - Number of EMIs already paid
  - Number of EMIs pending
  - Next EMI Due Date
  - Current status of the loan (On Track or Delayed)

  Calculate the remaining balance, months left, and determine the status. Assume 'On Track' if payments seem regular, otherwise 'Delayed'.
  Return the data in the specified JSON format. If a piece of information is not available in the statement, make a reasonable estimation or leave it empty where optional.
  For the next due date, provide it in YYYY-MM-DD format.`,
});

const analyzeEmiStatementFlow = ai.defineFlow(
  {
    name: 'analyzeEmiStatementFlow',
    inputSchema: EmiAnalysisInputSchema,
    outputSchema: EmiAnalysisSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
