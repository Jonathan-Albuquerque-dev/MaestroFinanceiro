"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Transaction } from "@/lib/types";

const chartConfig = {
  income: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Despesas",
    color: "hsl(var(--chart-2))",
  },
}

export function FlowChart({ transactions }: { transactions: Transaction[] }) {
    const monthlyData = eachMonthOfInterval({
        start: startOfMonth(new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))),
        end: new Date()
      }).map(month => {
        const monthStr = format(month, 'MMM', { locale: ptBR });
        const income = transactions
          .filter(t => t.type === 'income' && format(new Date(t.date), 'MMM', { locale: ptBR }) === monthStr)
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
          .filter(t => t.type === 'expense' && format(new Date(t.date), 'MMM', { locale: ptBR }) === monthStr)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return { month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1), income, expense };
      });


  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
        <CardDescription>Receitas vs. Despesas ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={monthlyData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
             <YAxis
                tickFormatter={(value) => `R$${value / 1000}k`}
             />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
