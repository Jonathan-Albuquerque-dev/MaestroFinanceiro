"use client";

import { useState } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Wallet,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SummaryCards } from "./summary-cards";
import { ExpensesChart } from "./expenses-chart";
import { FlowChart } from "./flow-chart";
import { RecentTransactions } from "./recent-transactions";
import { SavingsTips } from "./savings-tips";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { Button } from "./ui/button";

import { mockTransactions } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: (transactions.length + 1).toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
             <div className="p-2 rounded-lg bg-primary">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
             </div>
            <h1 className="text-xl font-bold font-headline">Maestro Financeiro</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 p-4 md:p-8 space-y-8">
            <header className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
                    <p className="text-muted-foreground">Sua visão geral financeira.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Wallet className="mr-2 h-4 w-4"/> Adicionar Transação
                  </Button>
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
            </header>

            <main>
                <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
                <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-7">
                    <div className="lg:col-span-4">
                        <FlowChart transactions={transactions} />
                    </div>
                    <div className="lg:col-span-3">
                        <ExpensesChart transactions={transactions} />
                    </div>
                </div>
                <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-7">
                    <div className="lg:col-span-4">
                        <RecentTransactions transactions={transactions} />
                    </div>
                    <div className="lg:col-span-3">
                        <SavingsTips transactions={transactions} />
                    </div>
                </div>
            </main>
        </div>
      </SidebarInset>
      <AddTransactionDialog 
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
    </SidebarProvider>
  );
}
