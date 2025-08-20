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
  CreditCard as CreditCardIcon,
  Banknote,
  Landmark,
  Wallet,
  Eye,
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
import { AddEditThirdPartyExpenseDialog } from "./add-edit-third-party-expense-dialog";
import { ViewInstallmentsDialog } from "./view-installments-dialog";
import type { ThirdPartyExpense, CreditCard as CreditCardType } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const paymentMethodIcons = {
  dinheiro: <Wallet className="h-4 w-4" />,
  pix: <Landmark className="h-4 w-4" />,
  debito: <Banknote className="h-4 w-4" />,
  credito: <CreditCardIcon className="h-4 w-4" />,
}

const paymentMethodLabels = {
    dinheiro: "Dinheiro",
    pix: "Pix",
    debito: "Débito",
    credito: "Crédito"
}

function formatDate(date: string | Timestamp) {
    if (typeof date === 'string') {
        return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
    }
    return format(date.toDate(), "dd/MM/yyyy", { locale: ptBR });
}

export function ThirdPartyExpensesDashboard() {
  const [thirdPartyExpenses, setThirdPartyExpenses] = useState<ThirdPartyExpense[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isViewInstallmentsOpen, setViewInstallmentsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ThirdPartyExpense | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "thirdPartyExpenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: ThirdPartyExpense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as ThirdPartyExpense);
      });
      setThirdPartyExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "creditCards"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cardsData: CreditCardType[] = [];
      querySnapshot.forEach((doc) => {
        cardsData.push({ id: doc.id, ...doc.data() } as CreditCardType);
      });
      setCreditCards(cardsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddOrUpdate = async (expense: Omit<ThirdPartyExpense, "id"> | ThirdPartyExpense) => {
    try {
      if ("id" in expense) {
        const docRef = doc(db, "thirdPartyExpenses", expense.id);
        await updateDoc(docRef, { ...expense });
        toast({
          title: "Sucesso!",
          description: "Despesa de terceiro atualizada com sucesso.",
        });
      } else {
        await addDoc(collection(db, "thirdPartyExpenses"), {...expense, paidInstallments: []});
        toast({
          title: "Sucesso!",
          description: "Despesa de terceiro adicionada com sucesso.",
        });
      }
    } catch (error) {
       console.error("Erro ao salvar despesa de terceiro: ", error);
       toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível salvar a despesa.",
      });
    }
  };

  const handleUpdateInstallments = async (expenseId: string, paidInstallments: number[]) => {
      try {
        const docRef = doc(db, "thirdPartyExpenses", expenseId);
        await updateDoc(docRef, { paidInstallments });
      } catch (error) {
         console.error("Erro ao atualizar parcelas: ", error);
         toast({
            variant: "destructive",
            title: "Erro!",
            description: "Não foi possível atualizar o status da parcela.",
        });
      }
  }

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, "thirdPartyExpenses", expenseId));
      toast({
        title: "Sucesso!",
        description: "Despesa de terceiro excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir despesa de terceiro: ", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível excluir a despesa.",
      });
    }
  }

  const openAddDialog = () => {
    setSelectedExpense(undefined);
    setAddEditDialogOpen(true);
  }

  const openEditDialog = (expense: ThirdPartyExpense) => {
    setSelectedExpense(expense);
    setAddEditDialogOpen(true);
  }
  
  const openViewInstallmentsDialog = (expense: ThirdPartyExpense) => {
      setSelectedExpense(expense);
      setViewInstallmentsOpen(true);
  }
  
  const totalThirdPartyExpenses = thirdPartyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
                <SidebarMenuButton>
                  <Repeat />
                  <span>Despesas Fixas</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <NextLink href="/third-party-expenses" passHref>
                <SidebarMenuButton isActive>
                  <Users />
                  <span>Despesas de Terceiros</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/credit-cards" passHref>
                <SidebarMenuButton>
                  <CreditCardIcon />
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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Despesas de Terceiros</h2>
                    <p className="text-muted-foreground">Gerencie os gastos de outras pessoas em seu cartão.</p>
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
                        <CardTitle>Total a Receber</CardTitle>
                        <CardDescription>A soma de todos os gastos de terceiros a serem reembolsados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-accent">
                           {totalThirdPartyExpenses.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Despesas</CardTitle>
                        <CardDescription>Despesas de terceiros cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                             <TableHead>Data</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Parcelas</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {thirdPartyExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.name}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>{formatDate(expense.date)}</TableCell>
                                <TableCell>
                                  {expense.paymentMethod && (
                                    <Badge variant="outline" className="flex items-center gap-1.5">
                                      {paymentMethodIcons[expense.paymentMethod]}
                                      {paymentMethodLabels[expense.paymentMethod]}
                                      {expense.paymentMethod === 'credito' && expense.creditCardId && ` (${creditCards.find(c => c.id === expense.creditCardId)?.name})`}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                    {expense.installments && expense.installments > 1 ? (
                                        <div className="flex items-center gap-2">
                                            <span>{`${expense.paidInstallments?.length || 0}/${expense.installments}`}</span>
                                            <Button variant="outline" size="sm" onClick={() => openViewInstallmentsDialog(expense)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right font-medium text-accent">
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
      <AddEditThirdPartyExpenseDialog
        open={isAddEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        onSave={handleAddOrUpdate}
        expense={selectedExpense}
        creditCards={creditCards}
      />
       {selectedExpense && (
        <ViewInstallmentsDialog
            open={isViewInstallmentsOpen}
            onOpenChange={setViewInstallmentsOpen}
            expense={selectedExpense}
            onUpdateInstallments={handleUpdateInstallments}
        />
       )}
    </SidebarProvider>
  );
}
