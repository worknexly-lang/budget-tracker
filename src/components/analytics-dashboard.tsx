
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
import Overview from "@/components/overview";
import CategoryChart from "@/components/category-chart";
import TrendsChart from "@/components/trends-chart";
import { useAuth } from "@/hooks/use-auth";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const getStorageKey = (key: string) => user ? `${key}_${user.uid}` : null;

  useEffect(() => {
    setIsMounted(true);
    if (!user) return;
    const storedTransactions = localStorage.getItem(getStorageKey("transactions")!);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, [user]);

  useEffect(() => {
    if (isMounted && user) {
      localStorage.setItem(getStorageKey("transactions")!, JSON.stringify(transactions));
    }
  }, [transactions, isMounted, user]);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, balance };
  }, [transactions]);
  
  if (!isMounted || !user) {
    // You can render a loading skeleton here
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <main className="flex flex-col gap-8">
        <Overview
          income={totalIncome}
          expenses={totalExpenses}
          balance={balance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CategoryChart transactions={transactions} />
            <TrendsChart transactions={transactions} />
        </div>
      </main>
    </div>
  );
}
