"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
import type { Transaction } from "@/types";
import { TrendingUp } from "lucide-react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type TrendsChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expense: {
    label: "Expenses",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function TrendsChart({ transactions }: TrendsChartProps) {
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailyData = daysInMonth.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        date: format(day, "MMM d"),
        income: 0,
        expense: 0,
      };
    });

    transactions.forEach((t) => {
      const dayIndex = new Date(t.date).getDate() - 1;
      if (dayIndex >= 0 && dayIndex < dailyData.length) {
        if (t.type === "income") {
          dailyData[dayIndex].income += t.amount;
        } else {
          dailyData[dayIndex].expense += t.amount;
        }
      }
    });

    return dailyData;
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          <CardTitle>Income vs. Expense Trends</CardTitle>
        </div>
        <CardDescription>
          A line chart showing your income and expenses over the current month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickFormatter={(value) => formatCurrency(value as number).replace('₹', '')} tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                content={<ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex flex-col">
                      <span className="font-bold">{chartConfig[name as keyof typeof chartConfig].label}</span>
                      <span>{formatCurrency(value as number)}</span>
                    </div>
                  )}
                  labelFormatter={(label) => format(new Date(chartData.find(d => d.date === label)?.date || Date.now()), "eeee, MMM d")}
                />}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke={chartConfig.income.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke={chartConfig.expense.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">No transaction data to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
