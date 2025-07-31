"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
import Overview from "@/components/overview";
import SavingsGoal from "@/components/savings-goal";
import TransactionsTable from "@/components/transactions-table";
import CategoryChart from "@/components/category-chart";
import AddTransactionDialog from "@/components/add-transaction-dialog";

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
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          BudgetWise
        </h1>
        <AddTransactionDialog onAddTransaction={handleAddTransaction} />
      </header>

      <main className="flex flex-col gap-8">
        <Overview
          income={totalIncome}
          expenses={totalExpenses}
          balance={balance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionsTable
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
          <aside className="lg:col-span-1 flex flex-col gap-8">
            <SavingsGoal
              goal={savingsGoal}
              balance={balance}
              onSetGoal={setSavingsGoal}
            />
            <CategoryChart transactions={transactions} />
          </aside>
        </div>
      </main>
    </div>
  );
}
