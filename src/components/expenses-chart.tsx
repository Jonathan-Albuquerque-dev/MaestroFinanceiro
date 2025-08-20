"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Transaction, FixedExpense } from "@/lib/types";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(190, 58%, 55%)",
  "hsl(330, 58%, 55%)",
];

export function ExpensesChart({ transactions, fixedExpenses }: { transactions: Transaction[], fixedExpenses: FixedExpense[] }) {
  const expenseData = React.useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    fixedExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      fill: chartColors[index % chartColors.length],
    }));
  }, [transactions, fixedExpenses]);
  
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = Object.fromEntries(expenseData.map(item => [item.name, {label: item.name}]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Distribuição dos seus gastos no mês atual.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {expenseData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                innerRadius="50%"
                strokeWidth={5}
              >
                 {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>Sem dados de despesas para exibir.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
