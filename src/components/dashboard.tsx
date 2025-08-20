"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Users,
  Wallet,
  Repeat,
  CreditCard,
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
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
import { AddTransactionDialog } from "./add-transaction-dialog";
import { Button } from "./ui/button";
import NextLink from "next/link";
import { db } from "@/lib/firebase";

import type { Transaction, FixedExpense, FamilyMemberIncome, ThirdPartyExpense } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [familyIncomes, setFamilyIncomes] = useState<FamilyMemberIncome[]>([]);
  const [thirdPartyExpenses, setThirdPartyExpenses] = useState<ThirdPartyExpense[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(transactionsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "fixedExpenses"), orderBy("description"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: FixedExpense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as FixedExpense);
      });
      setFixedExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "familyIncomes"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const incomesData: FamilyMemberIncome[] = [];
      querySnapshot.forEach((doc) => {
        incomesData.push({ id: doc.id, ...doc.data() } as FamilyMemberIncome);
      });
      setFamilyIncomes(incomesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "thirdPartyExpenses"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: ThirdPartyExpense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as ThirdPartyExpense);
      });
      setThirdPartyExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      await addDoc(collection(db, "transactions"), transaction);
      toast({
        title: "Sucesso!",
        description: "Transação adicionada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao adicionar transação: ", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível adicionar a transação.",
      });
    }
  };

  const transactionIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const familyIncome = familyIncomes.reduce((sum, i) => sum + i.income, 0);
  
  const totalIncome = transactionIncome + familyIncome;
  
  const totalVariableExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalFixedExpense = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = totalVariableExpense + totalFixedExpense;

  const totalThirdPartyExpenses = thirdPartyExpenses.reduce((sum, e) => sum + e.amount, 0);

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
              <NextLink href="/" passHref>
                <SidebarMenuButton isActive>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/incomes" passHref>
                <SidebarMenuButton>
                  <Users />
                  <span>Rendas</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/fixed-expenses" passHref>
                <SidebarMenuButton>
                  <Repeat />
                  <span>Despesas Fixas</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/third-party-expenses" passHref>
                <SidebarMenuButton>
                  <Users />
                  <span>Despesas de Terceiros</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/credit-cards" passHref>
                <SidebarMenuButton>
                  <CreditCard />
                  <span>Cartões de Crédito</span>
                </SidebarMenuButton>
              </NextLink>
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
                    <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
            </header>

            <main>
                <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} totalThirdPartyExpenses={totalThirdPartyExpenses} />
                <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-7">
                    <div className="lg:col-span-4">
                        <FlowChart transactions={transactions} />
                    </div>
                    <div className="lg:col-span-3">
                        <ExpensesChart transactions={transactions} fixedExpenses={fixedExpenses} />
                    </div>
                </div>
                <div className="grid gap-8 mt-8">
                    <div className="lg:col-span-4">
                        <RecentTransactions transactions={transactions} />
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
