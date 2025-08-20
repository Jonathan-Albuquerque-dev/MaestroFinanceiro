"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Users,
  Repeat,
  CreditCard,
  FileText,
  Calendar as CalendarIcon,
  Filter,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { format, addMonths, setDate, lastDayOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import type { Transaction, FixedExpense, MemberExpense, ThirdPartyExpense, FamilyMemberIncome, CreditCard as CreditCardType } from "@/lib/types";
import { categories } from "@/lib/mock-data";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";

type CombinedData = (Transaction | FixedExpense | MemberExpense | ThirdPartyExpense) & {dataType: string};
type ReportRow = [string, string, string, string, string];

export function ReportsDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [memberExpenses, setMemberExpenses] = useState<MemberExpense[]>([]);
  const [thirdPartyExpenses, setThirdPartyExpenses] = useState<ThirdPartyExpense[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberIncome[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);


  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  const { toast } = useToast();

  useEffect(() => {
    const unsubTransactions = onSnapshot(query(collection(db, "transactions")), (snap) =>
      setTransactions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction)))
    );
    const unsubFixed = onSnapshot(query(collection(db, "fixedExpenses")), (snap) =>
      setFixedExpenses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FixedExpense)))
    );
    const unsubMember = onSnapshot(query(collection(db, "memberExpenses")), (snap) =>
      setMemberExpenses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MemberExpense)))
    );
    const unsubThirdParty = onSnapshot(query(collection(db, "thirdPartyExpenses")), (snap) =>
      setThirdPartyExpenses(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ThirdPartyExpense))
      )
    );
    const unsubFamilyMembers = onSnapshot(query(collection(db, "familyIncomes")), (snap) =>
      setFamilyMembers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FamilyMemberIncome)))
    );
    const unsubCreditCards = onSnapshot(query(collection(db, "creditCards")), (snap) =>
      setCreditCards(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CreditCardType)))
    );

    return () => {
      unsubTransactions();
      unsubFixed();
      unsubMember();
      unsubThirdParty();
      unsubFamilyMembers();
      unsubCreditCards();
    };
  }, []);
  
  useEffect(() => {
      setPersonFilter("all");
  }, [originFilter]);

  const toDate = (date: string | Timestamp | Date): Date => {
    if (date instanceof Timestamp) return date.toDate();
    return new Date(date);
  }
  
  const getThirdPartyNames = () => {
    const names = thirdPartyExpenses.map(expense => expense.name);
    return [...new Set(names)];
  }

  const generateReport = () => {
    let combinedData: CombinedData[] = [];

    switch(originFilter) {
      case 'transactions':
        combinedData = transactions.map(t => ({...t, dataType: 'Transação'}));
        break;
      case 'fixedExpenses':
        combinedData = fixedExpenses.map(t => ({...t, date: new Date(), dataType: 'Despesa Fixa'}));
        break;
      case 'memberExpenses':
        combinedData = memberExpenses.map(t => ({...t, dataType: 'Despesa de Membro'}));
        break;
      case 'thirdPartyExpenses':
        combinedData = thirdPartyExpenses.map(t => ({...t, dataType: 'Despesa de Terceiro'}));
        break;
      default:
         combinedData = [
          ...transactions.map(t => ({...t, dataType: 'Transação'})),
          ...fixedExpenses.map(t => ({...t, date: new Date(), dataType: 'Despesa Fixa'})),
          ...memberExpenses.map(t => ({...t, dataType: 'Despesa de Membro'})),
          ...thirdPartyExpenses.map(t => ({...t, dataType: 'Despesa de Terceiro'})),
        ];
    }
    
    const filteredData = combinedData.filter(item => {
      let pass = true;

      // Type Filter
      if (typeFilter !== 'all') {
        if ('type' in item && item.type !== typeFilter) pass = false;
        if (!('type' in item) && typeFilter === 'income') pass = false;
      }
      
      // Person Filter
      if (personFilter !== 'all') {
        if (originFilter === 'memberExpenses' && 'memberId' in item && item.memberId !== personFilter) pass = false;
        if (originFilter === 'thirdPartyExpenses' && 'name' in item && item.name !== personFilter) pass = false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && 'category' in item && item.category !== categoryFilter) {
          pass = false;
      }
      if (categoryFilter !== 'all' && !('category' in item)) {
          pass = false;
      }


      // Date Filter
      if (dateFilter?.from && 'date' in item && toDate(item.date) < dateFilter.from) pass = false;
      if (dateFilter?.to && 'date' in item && toDate(item.date) > dateFilter.to) pass = false;
      
      return pass;
    });

    if (filteredData.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum dado encontrado",
        description: "Não há dados que correspondam aos filtros selecionados.",
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório Financeiro", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const filtersApplied = [
        `Origem: ${originFilter}`,
        `Tipo: ${typeFilter}`,
        `Categoria: ${categoryFilter}`,
        `Período: ${dateFilter?.from ? format(dateFilter.from, "dd/MM/yy") : 'N/A'} - ${dateFilter?.to ? format(dateFilter.to, "dd/MM/yy"): 'N/A'}`
    ];
    if (personFilter !== 'all' && (originFilter === 'memberExpenses' || originFilter === 'thirdPartyExpenses')) {
        const personName = originFilter === 'memberExpenses' 
            ? familyMembers.find(m => m.id === personFilter)?.name
            : personFilter;
        filtersApplied.push(`Pessoa: ${personName}`);
    }
    doc.text(filtersApplied.join(' | '), 14, 30);


    const tableBody: ReportRow[] = [];
    filteredData.forEach(item => {
      const isInstallmentExpense = ('installments' in item && item.installments && item.installments > 1 && item.paymentMethod === 'credito');

      if (isInstallmentExpense) {
        const expense = item as MemberExpense | ThirdPartyExpense;
        const card = creditCards.find(c => c.id === expense.creditCardId);
        if (card) {
          const purchaseDate = toDate(expense.date);
          const installmentAmount = (expense.amount / expense.installments!).toFixed(2);
          
          let firstInvoiceDate = purchaseDate.getDate() > card.closingDate
            ? addMonths(purchaseDate, 1)
            : purchaseDate;

          for (let i = 1; i <= expense.installments!; i++) {
             const monthForDueDate = addMonths(firstInvoiceDate, i-1);
             const lastDay = lastDayOfMonth(monthForDueDate);
             const dueDate = setDate(monthForDueDate, Math.min(card.dueDate, lastDay.getDate()));

             const description = `${expense.description} (${i}/${expense.installments})`;
             const type = 'Despesa';
             const category = 'category' in expense ? expense.category : 'N/A';
             const date = format(dueDate, 'dd/MM/yyyy');
             tableBody.push([date, description, type, category, installmentAmount]);
          }
        }
      } else {
         let description = 'N/A';
          if ('description' in item) {
              description = item.description;
          } else if ('name' in item && item.dataType !== 'Despesa de Terceiro') {
              description = (item as FamilyMemberIncome).name;
          } else if ('name' in item) {
              description = `${(item as ThirdPartyExpense).name} - ${item.description}`;
          }

          const type = 'type' in item ? (item.type === 'income' ? 'Receita' : 'Despesa') : 'Despesa';
          const category = 'category' in item ? item.category : 'N/A';
          const amount = item.amount.toFixed(2);
          const date = 'date' in item && item.date ? format(toDate(item.date), 'dd/MM/yyyy') : 'N/A';
          tableBody.push([date, description, type, category, amount])
      }
    });

    (doc as any).autoTable({
        startY: 35,
        head: [['Vencimento', 'Descrição', 'Tipo', 'Categoria', 'Valor (R$)']],
        body: tableBody,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save("relatorio-financeiro.pdf");
  };

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
                <SidebarMenuButton>
                  <CreditCard />
                  <span>Cartões de Crédito</span>
                </SidebarMenuButton>
              </NextLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NextLink href="/reports" passHref>
                <SidebarMenuButton isActive>
                  <FileText />
                  <span>Relatórios</span>
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
              <h2 className="text-3xl font-bold tracking-tight font-headline">Relatórios</h2>
              <p className="text-muted-foreground">
                Gere relatórios em PDF com base nos seus dados.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros do Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                   <div className="grid gap-2">
                     <Label htmlFor="origin">Origem</Label>
                    <Select value={originFilter} onValueChange={setOriginFilter}>
                      <SelectTrigger id="origin">
                        <SelectValue placeholder="Selecione uma origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="transactions">Transações</SelectItem>
                        <SelectItem value="fixedExpenses">Despesas Fixas</SelectItem>
                        <SelectItem value="memberExpenses">Despesas de Membros</SelectItem>
                        <SelectItem value="thirdPartyExpenses">Despesas de Terceiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid gap-2">
                     <Label htmlFor="type">Tipo</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter} disabled={originFilter === 'fixedExpenses' || originFilter === 'memberExpenses' || originFilter === 'thirdPartyExpenses'}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="income">Receitas</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(originFilter === 'memberExpenses' || originFilter === 'thirdPartyExpenses') && (
                    <div className="grid gap-2">
                      <Label htmlFor="person">Pessoa</Label>
                      <Select value={personFilter} onValueChange={setPersonFilter}>
                        <SelectTrigger id="person">
                          <SelectValue placeholder="Selecione uma pessoa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {originFilter === 'memberExpenses' && familyMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                          {originFilter === 'thirdPartyExpenses' && getThirdPartyNames().map(name => (
                             <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                     <Label htmlFor="category">Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Período</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal",
                              !dateFilter && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter?.from ? (
                              dateFilter.to ? (
                                <>
                                  {format(dateFilter.from, "LLL dd, y")} -{" "}
                                  {format(dateFilter.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateFilter.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Escolha um período</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter?.from}
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            numberOfMonths={2}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                </div>
                 <Button onClick={generateReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar PDF
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

    