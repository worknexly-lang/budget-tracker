"use client";

import { useState, useMemo } from "react";
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
import { Target } from "lucide-react";

type SavingsGoalProps = {
  goal: number;
  balance: number;
  onSetGoal: (goal: number) => void;
};

export default function SavingsGoal({
  goal,
  balance,
  onSetGoal,
}: SavingsGoalProps) {
  const [newGoal, setNewGoal] = useState<string>(goal.toString());

  const progress = useMemo(() => {
    if (goal <= 0) return 0;
    return Math.max(0, Math.min(100, (balance / goal) * 100));
  }, [balance, goal]);

  const handleSetGoal = () => {
    const goalValue = parseFloat(newGoal);
    if (!isNaN(goalValue) && goalValue > 0) {
      onSetGoal(goalValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6" />
          <CardTitle>Savings Goal</CardTitle>
        </div>
        <CardDescription>
          Set and track your monthly savings goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{formatCurrency(balance)} / {formatCurrency(goal)}</span>
        </div>
        <Progress value={progress} aria-label={`${progress.toFixed(0)}% of savings goal reached`} />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Input
          type="number"
          placeholder="Set new goal"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSetGoal} className="w-full sm:w-auto">Set Goal</Button>
      </CardFooter>
    </Card>
  );
}
