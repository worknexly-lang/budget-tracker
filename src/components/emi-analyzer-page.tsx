
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Upload, FileText, BarChart, Calendar, Banknote, Hourglass, CheckCircle, XCircle, Save, Trash2, List, Check } from "lucide-react";
import { analyzeEmiStatement, type EmiAnalysis } from "@/ai/flows/analyze-emi-statement";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { format, isThisMonth, parseISO } from "date-fns";
import EmiSummaryCard from "./emi-summary-card";

const formSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0, "Please upload a file."),
});

export default function EmiAnalyzerPage() {
  const [analysis, setAnalysis] = useState<EmiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedLoans, setSavedLoans] = useState<EmiAnalysis[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    const storedLoans = localStorage.getItem("savedLoans");
    if (storedLoans) {
      setSavedLoans(JSON.parse(storedLoans));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("savedLoans", JSON.stringify(savedLoans));
    }
  }, [savedLoans, isMounted]);

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

  const handleAnalysisChange = (field: keyof EmiAnalysis, value: string | number) => {
    if (!analysis) return;

    const newAnalysis = { ...analysis };

    if (typeof newAnalysis[field] === 'number') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            (newAnalysis[field] as number) = numValue;
        }
    } else {
        (newAnalysis[field] as string) = String(value);
    }

    if (field === 'emisPaid' || field === 'tenure') {
        const emisPaid = field === 'emisPaid' ? Number(value) : newAnalysis.emisPaid;
        const tenure = field === 'tenure' ? Number(value) : newAnalysis.tenure;
        
        if (!isNaN(emisPaid) && !isNaN(tenure) && emisPaid <= tenure) {
            newAnalysis.emisPending = tenure - emisPaid;
        }
    }

    setAnalysis(newAnalysis);
  };

  const handleSaveDetails = () => {
    if (analysis) {
        setSavedLoans(prev => [...prev, { ...analysis, lastUpdated: new Date().toISOString() }]);
        setAnalysis(null);
        toast({
            title: "Loan Saved",
            description: "Your loan details have been saved successfully.",
        });
    }
  };
  
  const handleDeleteLoan = (index: number) => {
    setSavedLoans(prev => prev.filter((_, i) => i !== index));
    toast({
        title: "Loan Deleted",
        description: "The loan has been removed from your saved list.",
    });
  };

  const handleMarkAsPaid = (index: number) => {
    setSavedLoans(prev => {
        const updatedLoans = [...prev];
        const loanToUpdate = { ...updatedLoans[index] };
        
        if (loanToUpdate.emisPending > 0) {
            loanToUpdate.emisPaid += 1;
            loanToUpdate.emisPending -= 1;
            loanToUpdate.lastUpdated = new Date().toISOString();
            if (loanToUpdate.emisPending === 0) {
                loanToUpdate.status = 'On Track'; 
            }
            updatedLoans[index] = loanToUpdate;
        }
        return updatedLoans;
    });
    toast({
        title: "EMI Marked as Paid",
        description: "You've successfully tracked this month's payment.",
    });
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">EMI Analyzer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <Card>
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
            <EmiSummaryCard />
        </div>

        <div className="lg:col-span-2">
            {isLoading && (
                <Card className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4 p-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analyzing your document...</p>
                    </div>
                </Card>
            )}

            {analysis && !isLoading && (
            <Card>
                <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>Review and edit the extracted details from your statement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Loan Name / Lender</span>
                    </div>
                    <Input
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.loanName}
                        onChange={(e) => handleAnalysisChange('loanName', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5" />
                    <span className="font-semibold">Total Amount</span>
                    </div>
                    <Input
                        type="number"
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.totalAmount}
                        onChange={(e) => handleAnalysisChange('totalAmount', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5" />
                    <span className="font-semibold">EMI Amount</span>
                    </div>
                    <Input
                        type="number"
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.emiAmount}
                        onChange={(e) => handleAnalysisChange('emiAmount', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <BarChart className="h-5 w-5" />
                    <span className="font-semibold">Interest Rate (%)</span>
                    </div>
                    <Input
                        type="number"
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.interestRate || ''}
                        placeholder="N/A"
                        onChange={(e) => handleAnalysisChange('interestRate', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Tenure (Months)</span>
                    </div>
                    <Input
                        type="number"
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.tenure}
                        onChange={(e) => handleAnalysisChange('tenure', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">EMIs Paid</span>
                    </div>
                    <Input
                        type="number"
                        className="font-mono text-right bg-transparent border-0 h-auto p-0"
                        value={analysis.emisPaid}
                        onChange={(e) => handleAnalysisChange('emisPaid', e.target.value)}
                    />
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
                <Button className="w-full" onClick={handleSaveDetails}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Details
                </Button>
                </CardFooter>
            </Card>
            )}

            {savedLoans.length > 0 && !analysis && !isLoading && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <List className="h-6 w-6" />
                            <CardTitle>Saved Loans</CardTitle>
                        </div>
                        <CardDescription>
                            A list of your saved loan analyses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {savedLoans.map((loan, index) => {
                            const hasPaidThisMonth = loan.lastUpdated ? isThisMonth(parseISO(loan.lastUpdated)) : false;
                            const isCompleted = loan.emisPending === 0;
                            
                            return (
                                <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleDeleteLoan(index)}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <h3 className="font-semibold text-lg">{loan.loanName}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                        <p><strong>Total:</strong> {formatCurrency(loan.totalAmount)}</p>
                                        <p><strong>EMI:</strong> {formatCurrency(loan.emiAmount)}</p>
                                        <p><strong>Rate:</strong> {loan.interestRate || 'N/A'}%</p>
                                        <p><strong>Paid:</strong> {loan.emisPaid} / {loan.tenure}</p>
                                        <p><strong>Pending:</strong> {loan.emisPending} EMIs</p>
                                        <p><strong>Status:</strong> 
                                            <span className={`font-bold ${isCompleted ? 'text-green-500' : (loan.status === 'On Track' ? 'text-green-500' : 'text-red-500')}`}>
                                                {isCompleted ? 'Completed' : loan.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Button 
                                            onClick={() => handleMarkAsPaid(index)}
                                            disabled={hasPaidThisMonth || isCompleted}
                                            className="w-full sm:w-auto"
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            {hasPaidThisMonth ? 'Paid this month' : 'Mark as Paid'}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
