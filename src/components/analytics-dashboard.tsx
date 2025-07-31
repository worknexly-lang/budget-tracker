"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
import Overview from "@/components/overview";
import CategoryChart from "@/components/category-chart";
import TrendsChart from "@/components/trends-chart";

export default function AnalyticsDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

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
  
  if (!isMounted) {
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
