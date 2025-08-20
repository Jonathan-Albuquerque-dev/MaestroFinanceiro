
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
import { AddEditMemberExpenseDialog } from "./add-edit-member-expense-dialog";
import type { MemberExpense, CreditCard as CreditCardType, FamilyMemberIncome } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { format, getYear, getMonth } from 'date-fns';
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

function getCurrentInstallmentText(expense: MemberExpense): string {
    if (!expense.installments || expense.installments <= 1) {
        return 'N/A';
    }

    const expenseDate = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date);
    const now = new Date();
    
    const monthsDiff = (getYear(now) - getYear(expenseDate)) * 12 + (getMonth(now) - getMonth(expenseDate));

    if (monthsDiff < 0) {
       return `1/${expense.installments}`;
    }

    const currentInstallment = monthsDiff + 1;

    if (currentInstallment > expense.installments) {
        return `${expense.installments}/${expense.installments}`;
    }

    return `${currentInstallment}/${expense.installments}`;
}

export function MemberExpensesDashboard() {
  const [memberExpenses, setMemberExpenses] = useState<MemberExpense[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberIncome[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<MemberExpense | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "memberExpenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: MemberExpense[] = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as MemberExpense);
      });
      setMemberExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "familyIncomes"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const membersData: FamilyMemberIncome[] = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() } as FamilyMemberIncome);
      });
      setFamilyMembers(membersData);
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

  const handleAddOrUpdate = async (expense: Omit<MemberExpense, "id"> | MemberExpense) => {
    try {
      if ("id" in expense) {
        const docRef = doc(db, "memberExpenses", expense.id);
        await updateDoc(docRef, { ...expense });
        toast({
          title: "Sucesso!",
          description: "Despesa do membro atualizada com sucesso.",
        });
      } else {
        await addDoc(collection(db, "memberExpenses"), expense);
        toast({
          title: "Sucesso!",
          description: "Despesa do membro adicionada com sucesso.",
        });
      }
    } catch (error) {
       console.error("Erro ao salvar despesa do membro: ", error);
       toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível salvar a despesa.",
      });
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, "memberExpenses", expenseId));
      toast({
        title: "Sucesso!",
        description: "Despesa do membro excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir despesa do membro: ", error);
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

  const openEditDialog = (expense: MemberExpense) => {
    setSelectedExpense(expense);
    setAddEditDialogOpen(true);
  }
  
  const totalMemberExpenses = memberExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getMemberName = (memberId: string) => {
      return familyMembers.find(m => m.id === memberId)?.name || 'Desconhecido';
  }

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
                <SidebarMenuButton isActive>
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
                <SidebarMenuButton>
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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Despesas dos Membros</h2>
                    <p className="text-muted-foreground">Gerencie os gastos dos membros da sua família.</p>
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
                        <CardTitle>Total de Despesas dos Membros</CardTitle>
                        <CardDescription>A soma de todos os gastos dos membros da família.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-destructive">
                           {totalMemberExpenses.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Despesas</CardTitle>
                        <CardDescription>Despesas dos membros cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Membro</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Parcelas</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {memberExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{getMemberName(expense.memberId)}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>{formatDate(expense.date)}</TableCell>
                                <TableCell>{expense.category}</TableCell>
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
                                    {getCurrentInstallmentText(expense)}
                                 </TableCell>
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
      <AddEditMemberExpenseDialog
        open={isAddEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        onSave={handleAddOrUpdate}
        expense={selectedExpense}
        creditCards={creditCards}
        familyMembers={familyMembers}
      />
    </SidebarProvider>
  );
}

    