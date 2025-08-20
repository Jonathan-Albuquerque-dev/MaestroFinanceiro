"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Users,
  PlusCircle,
  Repeat,
  MoreHorizontal,
  Pencil,
  Trash2,
  CreditCard,
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
import { Button } from "./ui/button";
import NextLink from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddEditFixedExpenseDialog } from "./add-edit-fixed-expense-dialog";
import type { FixedExpense } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function FixedExpensesDashboard() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | undefined>(undefined);
  const { toast } = useToast();

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

  const handleAddOrUpdate = async (expense: Omit<FixedExpense, "id"> | FixedExpense) => {
    try {
      if ("id" in expense) {
        const docRef = doc(db, "fixedExpenses", expense.id);
        await updateDoc(docRef, { ...expense });
        toast({
          title: "Sucesso!",
          description: "Despesa atualizada com sucesso.",
        });
      } else {
        await addDoc(collection(db, "fixedExpenses"), expense);
        toast({
          title: "Sucesso!",
          description: "Despesa adicionada com sucesso.",
        });
      }
    } catch (error) {
       console.error("Erro ao salvar despesa: ", error);
       toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível salvar a despesa.",
      });
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, "fixedExpenses", expenseId));
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir despesa: ", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível excluir a despesa.",
      });
    }
  }

  const openAddDialog = () => {
    setSelectedExpense(undefined);
    setDialogOpen(true);
  }

  const openEditDialog = (expense: FixedExpense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  }
  
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
                <SidebarMenuButton>
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
              <NextLink href="/member-expenses" passHref>
                <SidebarMenuButton>
                  <Users />
                  <span>Despesas dos Membros</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <NextLink href="/fixed-expenses" passHref>
                <SidebarMenuButton isActive>
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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Despesas Fixas</h2>
                    <p className="text-muted-foreground">Gerencie suas despesas recorrentes.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Despesa
                  </Button>
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
            </header>

            <main className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Despesas Fixas</CardTitle>
                        <CardDescription>A soma de todas as suas despesas fixas mensais.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-destructive">
                           {totalFixedExpenses.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Despesas</CardTitle>
                        <CardDescription>Suas despesas fixas cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Valor Mensal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fixedExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.description}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell className="text-right font-medium text-destructive">
                                    {expense.amount.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                                         <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
      </SidebarInset>
      <AddEditFixedExpenseDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddOrUpdate}
        expense={selectedExpense}
      />
    </SidebarProvider>
  );
}
