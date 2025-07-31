
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import type { EmiAnalysis } from "@/ai/flows/analyze-emi-statement";
import { isThisMonth, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function EmiSummaryCard() {
  const [savedLoans, setSavedLoans] = useState<EmiAnalysis[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLoans = localStorage.getItem("savedLoans");
    if (storedLoans) {
      setSavedLoans(JSON.parse(storedLoans));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
        const storedLoans = localStorage.getItem("savedLoans");
        if (storedLoans) {
            setSavedLoans(JSON.parse(storedLoans));
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <CardTitle>EMI Loan Tracker</CardTitle>
          </div>
           <CardDescription>
            A summary of your active loans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 rounded-md bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const activeLoans = savedLoans.filter(loan => loan.emisPending > 0);
  const loansDueThisMonth = activeLoans.filter(loan => {
      const hasPaidThisMonth = loan.lastUpdated ? isThisMonth(parseISO(loan.lastUpdated)) : false;
      return !hasPaidThisMonth;
  });
  
  const totalMonthlyEmi = activeLoans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const totalRemainingBalance = activeLoans.reduce((sum, loan) => sum + (loan.emiAmount * loan.emisPending), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6" />
          <CardTitle>EMI Loan Tracker</CardTitle>
        </div>
        <CardDescription>
          A summary of your active loans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeLoans.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Loans</span>
              <span className="font-bold text-lg">{activeLoans.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payments Due</span>
               <span className={`font-bold text-lg ${loansDueThisMonth.length > 0 ? 'text-yellow-500' : 'text-green-500'}`}>{loansDueThisMonth.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Monthly EMI</span>
              <span className="font-bold text-sm">{formatCurrency(totalMonthlyEmi)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Remaining</span>
              <span className="font-bold text-sm">{formatCurrency(totalRemainingBalance)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p>No active loans found.</p>
            <p className="text-xs">Add one by uploading a statement.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
