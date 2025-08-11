
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
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
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Target, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SavingsGoalPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<number>(1000);
  const [newGoal, setNewGoal] = useState<string>(savingsGoal.toString());
  const [isMounted, setIsMounted] = useState(false);

  const getStorageKey = (key: string) => user ? `${key}_${user.uid}` : null;

  useEffect(() => {
    setIsMounted(true);
    if (!user) return;
    const storedTransactions = localStorage.getItem(getStorageKey("transactions")!);
    const storedSavingsGoal = localStorage.getItem(getStorageKey("savingsGoal")!);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    if (storedSavingsGoal) {
      const goal = JSON.parse(storedSavingsGoal);
      setSavingsGoal(goal);
      setNewGoal(goal.toString());
    }
  }, [user]);

  useEffect(() => {
    if (isMounted && user) {
      localStorage.setItem(getStorageKey("savingsGoal")!, JSON.stringify(savingsGoal));
    }
  }, [savingsGoal, isMounted, user]);

  const balance = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIncome - totalExpenses;
  }, [transactions]);
  
  const progress = useMemo(() => {
    if (savingsGoal <= 0) return 0;
    return Math.max(0, Math.min(100, (balance / savingsGoal) * 100));
  }, [balance, savingsGoal]);

  const handleSetGoal = () => {
    const goalValue = parseFloat(newGoal);
    if (!isNaN(goalValue) && goalValue > 0) {
      setSavingsGoal(goalValue);
    }
  };

  if (!isMounted || !user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Savings Goal</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Savings Goal</h2>
      </div>

      <main className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-3">
                    <Target className="h-6 w-6" />
                    <CardTitle>Track Your Savings</CardTitle>
                    </div>
                    <CardDescription>
                    Set a goal and see how close you are to reaching it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 py-10">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="text-5xl font-bold tracking-tighter text-primary">
                            {formatCurrency(balance)}
                        </div>
                        <div className="text-muted-foreground">
                            Saved towards your {formatCurrency(savingsGoal)} goal
                        </div>
                    </div>
                    <Progress value={progress} aria-label={`${progress.toFixed(0)}% of savings goal reached`} />
                    {progress >= 100 && (
                        <div className="flex items-center justify-center gap-2 text-lg font-medium text-emerald-500">
                            <Trophy className="h-6 w-6"/>
                            <span>Congratulations! You've reached your goal!</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Input
                    type="number"
                    placeholder="Set new goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="flex-grow"
                    />
                    <Button onClick={handleSetGoal} className="w-full sm:w-auto">Set New Goal</Button>
                </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  );
}
