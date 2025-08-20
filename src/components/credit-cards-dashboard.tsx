"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Users,
  PlusCircle,
  Repeat,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddEditCreditCardDialog } from "./add-edit-credit-card-dialog";
import type { CreditCard as CreditCardType, Transaction, ThirdPartyExpense, MemberExpense } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getMonth, getYear, set, isAfter, subMonths, addMonths } from "date-fns";

type GenericExpense = (Transaction | ThirdPartyExpense | MemberExpense) & { type?: 'transaction' | 'thirdParty' | 'member' };

function getInvoiceForCard(card: CreditCardType, transactions: Transaction[], thirdPartyExpenses: ThirdPartyExpense[], memberExpenses: MemberExpense[]): number {
    const now = new Date();
    
    // Define the current invoice period
    const today = now.getDate();
    
    let invoiceEndDate: Date;
    if (today <= card.closingDate) {
      invoiceEndDate = set(now, { date: card.closingDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
    } else {
      invoiceEndDate = addMonths(set(now, { date: card.closingDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }), 1);
    }

    const allExpenses: GenericExpense[] = [
        ...transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'credito' && t.creditCardId === card.id).map(t => ({...t, type: 'transaction'})),
        ...thirdPartyExpenses.filter(t => t.paymentMethod === 'credito' && t.creditCardId === card.id).map(t => ({...t, type: 'thirdParty'})),
        ...memberExpenses.filter(t => t.paymentMethod === 'credito' && t.creditCardId === card.id).map(t => ({...t, type: 'member'}))
    ];

    let invoiceTotal = 0;

    allExpenses.forEach(expense => {
        const expenseDate = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date);
        const installments = expense.installments || 1;
        const installmentAmount = expense.amount / installments;
        
        for (let i = 0; i < installments; i++) {
            const currentInstallmentDate = addMonths(expenseDate, i);
            
            // Determine which invoice this installment belongs to
            const expenseClosingDateThisMonth = set(currentInstallmentDate, { date: card.closingDate });

            let installmentInvoiceEndDate;
            if(isAfter(currentInstallmentDate, expenseClosingDateThisMonth)){
                installmentInvoiceEndDate = addMonths(expenseClosingDateThisMonth, 1);
            } else {
                installmentInvoiceEndDate = expenseClosingDateThisMonth;
            }

            // Check if the installment's invoice period matches the current invoice period
            if (getYear(installmentInvoiceEndDate) === getYear(invoiceEndDate) && getMonth(installmentInvoiceEndDate) === getMonth(invoiceEndDate)) {
                 invoiceTotal += installmentAmount;
            }
        }
    });

    return invoiceTotal;
}

export function CreditCardsDashboard() {
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [thirdPartyExpenses, setThirdPartyExpenses] = useState<ThirdPartyExpense[]>([]);
  const [memberExpenses, setMemberExpenses] = useState<MemberExpense[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | undefined>(undefined);
  const [paidInvoices, setPaidInvoices] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const qCards = query(collection(db, "creditCards"), orderBy("name"));
    const unsubCards = onSnapshot(qCards, (snapshot) => {
      const cardsData: CreditCardType[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditCardType));
      setCreditCards(cardsData);
    });

    const qTransactions = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
        const transactionsData: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(transactionsData);
    });
    
    const qThirdParty = query(collection(db, "thirdPartyExpenses"), orderBy("date", "desc"));
    const unsubThirdParty = onSnapshot(qThirdParty, (snapshot) => {
        const expensesData: ThirdPartyExpense[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThirdPartyExpense));
        setThirdPartyExpenses(expensesData);
    });

     const qMemberExpenses = query(collection(db, "memberExpenses"), orderBy("date", "desc"));
    const unsubMemberExpenses = onSnapshot(qMemberExpenses, (snapshot) => {
        const expensesData: MemberExpense[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemberExpense));
        setMemberExpenses(expensesData);
    });

    return () => {
        unsubCards();
        unsubTransactions();
        unsubThirdParty();
        unsubMemberExpenses();
    };
  }, []);

  const handleAddOrUpdate = async (card: Omit<CreditCardType, "id"> | CreditCardType) => {
    try {
      if ("id" in card) {
        const docRef = doc(db, "creditCards", card.id);
        await updateDoc(docRef, { ...card });
        toast({
          title: "Sucesso!",
          description: "Cartão atualizado com sucesso.",
        });
      } else {
        await addDoc(collection(db, "creditCards"), card);
        toast({
          title: "Sucesso!",
          description: "Cartão adicionado com sucesso.",
        });
      }
    } catch (error) {
       console.error("Erro ao salvar cartão: ", error);
       toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível salvar o cartão.",
      });
    }
  };

  const handleDelete = async (cardId: string) => {
    try {
      await deleteDoc(doc(db, "creditCards", cardId));
      toast({
        title: "Sucesso!",
        description: "Cartão excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir cartão: ", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível excluir o cartão.",
      });
    }
  }

  const handleMarkAsPaid = async (card: CreditCardType) => {
    try {
        const now = new Date();
        const today = now.getDate();
        let invoiceEndDate: Date;
        if (today <= card.closingDate) {
            invoiceEndDate = set(now, { date: card.closingDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
        } else {
            invoiceEndDate = addMonths(set(now, { date: card.closingDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }), 1);
        }

        const expensesToUpdate: { expense: MemberExpense, installmentNumber: number }[] = [];

        memberExpenses
            .filter(expense => expense.paymentMethod === 'credito' && expense.creditCardId === card.id)
            .forEach(expense => {
                const expenseDate = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date);
                const installments = expense.installments || 1;

                for (let i = 0; i < installments; i++) {
                    const installmentNumber = i + 1;
                    const currentInstallmentDate = addMonths(expenseDate, i);
                    const expenseClosingDateThisMonth = set(currentInstallmentDate, { date: card.closingDate });

                    let installmentInvoiceEndDate;
                    if (isAfter(currentInstallmentDate, expenseClosingDateThisMonth)) {
                        installmentInvoiceEndDate = addMonths(expenseClosingDateThisMonth, 1);
                    } else {
                        installmentInvoiceEndDate = expenseClosingDateThisMonth;
                    }

                    if (getYear(installmentInvoiceEndDate) === getYear(invoiceEndDate) && getMonth(installmentInvoiceEndDate) === getMonth(invoiceEndDate)) {
                        if (!expense.paidInstallments?.includes(installmentNumber)) {
                            expensesToUpdate.push({ expense, installmentNumber });
                        }
                    }
                }
            });

        if (expensesToUpdate.length > 0) {
            const batch = writeBatch(db);
            expensesToUpdate.forEach(({ expense, installmentNumber }) => {
                const docRef = doc(db, "memberExpenses", expense.id);
                const newPaidInstallments = [...(expense.paidInstallments || []), installmentNumber];
                batch.update(docRef, { paidInstallments: newPaidInstallments });
            });
            await batch.commit();
        }

        setPaidInvoices(prev => ({ ...prev, [card.id]: true }));
        toast({
            title: "Fatura Paga!",
            description: "A fatura deste cartão foi marcada como paga e as parcelas das despesas dos membros foram atualizadas.",
        });

    } catch (error) {
        console.error("Erro ao marcar fatura como paga: ", error);
        toast({
            variant: "destructive",
            title: "Erro!",
            description: "Não foi possível processar o pagamento da fatura.",
        });
    }
}

  const openAddDialog = () => {
    setSelectedCard(undefined);
    setDialogOpen(true);
  }

  const openEditDialog = (card: CreditCardType) => {
    setSelectedCard(card);
    setDialogOpen(true);
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
                <SidebarMenuButton>
                  <Users />
                  <span>Despesas de Terceiros</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/credit-cards" passHref>
                <SidebarMenuButton isActive>
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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Faturas dos Cartões</h2>
                    <p className="text-muted-foreground">Gerencie as faturas dos seus cartões de crédito.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Cartão
                  </Button>
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
            </header>

            <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {creditCards.map((card) => {
                  const invoiceTotal = getInvoiceForCard(card, transactions, thirdPartyExpenses, memberExpenses);
                  const isPaid = paidInvoices[card.id];
                  
                  return (
                    <Card key={card.id} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{card.name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(card)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(card.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription>
                            Fecha dia {card.closingDate} • Vence dia {card.dueDate}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-sm text-muted-foreground">Valor da Fatura</div>
                             <p className={`text-2xl font-bold ${isPaid ? 'text-primary' : 'text-destructive'}`}>
                                {invoiceTotal.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                })}
                            </p>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button className="w-full" onClick={() => handleMarkAsPaid(card)} disabled={isPaid}>
                                {isPaid ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                                {isPaid ? 'Fatura Paga' : 'Marcar como Paga'}
                            </Button>
                        </div>
                    </Card>
                  )
               })}
            </main>
        </div>
      </SidebarInset>
      <AddEditCreditCardDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddOrUpdate}
        card={selectedCard}
      />
    </SidebarProvider>
  );
}
