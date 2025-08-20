"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Timestamp } from "firebase/firestore";

function formatDate(date: string | Timestamp) {
    if (typeof date === 'string') {
        return format(new Date(date), "dd 'de' MMM, yyyy", { locale: ptBR })
    }
    return format(date.toDate(), "dd 'de' MMM, yyyy", { locale: ptBR });
}

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>
          Você tem {transactions.length} transações este mês.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {transaction.type === 'income' ? 
                      <ArrowUpCircle className="h-5 w-5 text-primary" /> : 
                      <ArrowDownCircle className="h-5 w-5 text-destructive" />
                    }
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <Badge variant="outline" className="mt-1">{transaction.category}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(transaction.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
