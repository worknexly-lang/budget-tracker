"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction, ExpenseCategory } from "@/types";
import { PieChart as PieChartIcon } from "lucide-react";

type CategoryChartProps = {
  transactions: Transaction[];
};

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category as ExpenseCategory;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const chartData = Object.entries(categoryTotals).map(([key, value]) => ({
      name: key,
      value,
    }));

    const chartConfig: ChartConfig = {};
    chartData.forEach((item, index) => {
      chartConfig[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });

    return { chartData, chartConfig };
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <PieChartIcon className="h-6 w-6" />
          <CardTitle>Spending by Category</CardTitle>
        </div>
        <CardDescription>
          A breakdown of your expenses for this period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="value" />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">No expense data to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
