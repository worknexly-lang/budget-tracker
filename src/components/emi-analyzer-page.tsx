
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, FileText, BarChart, Calendar, Banknote, Hourglass, CheckCircle, XCircle } from "lucide-react";
import { analyzeEmiStatement, type EmiAnalysis } from "@/ai/flows/analyze-emi-statement";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

const formSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0, "Please upload a file."),
});

export default function EmiAnalyzerPage() {
  const [analysis, setAnalysis] = useState<EmiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const fileDataUri = await fileToBase64(values.file);
      const result = await analyzeEmiStatement({ fileDataUri });
      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: "We've analyzed your statement. Please review the details.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze the statement. Please try another file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">EMI Analyzer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Statement</CardTitle>
            <CardDescription>
              Upload your loan statement (PDF or Excel) to get started.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Loan Statement File</FormLabel>
                      <FormControl>
                         <Input 
                            type="file" 
                            accept=".pdf,.xls,.xlsx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                            }}
                            {...rest} 
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Analyze Statement
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
            <Card className="lg:col-span-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analyzing your document...</p>
                </div>
            </Card>
        )}

        {analysis && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>Review the extracted details from your statement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">Loan Name / Lender</span>
                </div>
                <span className="font-mono">{analysis.loanName}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5" />
                  <span className="font-semibold">Total Amount</span>
                </div>
                <span className="font-mono">{formatCurrency(analysis.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5" />
                  <span className="font-semibold">EMI Amount</span>
                </div>
                <span className="font-mono">{formatCurrency(analysis.emiAmount)}</span>
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <BarChart className="h-5 w-5" />
                  <span className="font-semibold">Interest Rate</span>
                </div>
                <span className="font-mono">{analysis.interestRate ? `${analysis.interestRate}%` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Tenure (Months)</span>
                </div>
                <span className="font-mono">{analysis.tenure}</span>
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">EMIs Paid</span>
                </div>
                <span className="font-mono">{analysis.emisPaid}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Hourglass className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">EMIs Pending</span>
                </div>
                <span className="font-mono">{analysis.emisPending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                   {analysis.status === 'On Track' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  <span className="font-semibold">Status</span>
                </div>
                <span className={`font-mono font-bold ${analysis.status === 'On Track' ? 'text-green-500' : 'text-red-500'}`}>{analysis.status}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Details</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
