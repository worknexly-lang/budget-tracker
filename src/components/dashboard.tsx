
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
import Overview from "@/components/overview";
import SavingsGoal from "@/components/savings-goal";
import TransactionsTable from "@/components/transactions-table";
import CategoryChart from "@/components/category-chart";
import AddTransactionForm from "@/components/add-transaction-form";
import EmiSummaryCard from "@/components/emi-summary-card";
import { DollarSign } from "lucide-react";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<number>(1000);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTransactions = localStorage.getItem("transactions");
    const storedSavingsGoal = localStorage.getItem("savingsGoal");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    if (storedSavingsGoal) {
      setSavingsGoal(JSON.parse(storedSavingsGoal));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("savingsGoal", JSON.stringify(savingsGoal));
    }
  }, [savingsGoal, isMounted]);

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

  const handleAddTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };
  
  if (!isMounted) {
    // You can render a loading skeleton here
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <main className="flex flex-col gap-8">
        <Overview
          income={totalIncome}
          expenses={totalExpenses}
          balance={balance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <TransactionsTable
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
          <aside className="lg:col-span-1 flex flex-col gap-8">
            <AddTransactionForm onAddTransaction={handleAddTransaction} />
          </aside>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CategoryChart transactions={transactions} />
            <SavingsGoal
              goal={savingsGoal}
              balance={balance}
              onSetGoal={setSavingsGoal}
            />
            <EmiSummaryCard />
        </div>
      </main>
    </div>
  );
}
