
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { EmiAnalysis } from "@/ai/flows/analyze-emi-statement";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "./ui/button";

export default function EmiDashboard() {
  const [savedLoans, setSavedLoans] = useState<EmiAnalysis[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLoans = localStorage.getItem("savedLoans");
    if (storedLoans) {
      setSavedLoans(JSON.parse(storedLoans));
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  if (savedLoans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <List className="h-6 w-6" />
            <CardTitle>EMI Loan Dashboard</CardTitle>
          </div>
          <CardDescription>
            A summary of your active loans.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 gap-4">
          <p className="text-muted-foreground">You have no saved loans.</p>
          <Link href="/dashboard/emi">
            <Button>Analyze a Loan Statement</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <List className="h-6 w-6" />
          <CardTitle>EMI Loan Dashboard</CardTitle>
        </div>
        <CardDescription>
          A summary of your active loans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {savedLoans.map((loan, index) => {
          const progress = (loan.emisPaid / loan.tenure) * 100;
          return (
            <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{loan.loanName}</h3>
                        <p className="text-sm text-muted-foreground">Next due date: {loan.nextDueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {loan.status === 'On Track' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                        <span className={`font-mono font-bold ${loan.status === 'On Track' ? 'text-green-500' : 'text-red-500'}`}>{loan.status}</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Paid: {formatCurrency(loan.emiAmount * loan.emisPaid)}</span>
                        <span>Total: {formatCurrency(loan.totalAmount)}</span>
                    </div>
                    <Progress value={progress} />
                     <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">{loan.emisPaid} / {loan.tenure} EMIs paid</span>
                        <span className="text-muted-foreground">{loan.emisPending} EMIs remaining</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm pt-2">
                    <div><strong>EMI Amount:</strong> {formatCurrency(loan.emiAmount)}</div>
                    <div><strong>Interest Rate:</strong> {loan.interestRate || 'N/A'}%</div>
                </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
