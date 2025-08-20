"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Users,
  PlusCircle,
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
import { AddIncomeDialog } from "./add-income-dialog";
import type { FamilyMemberIncome } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


export function IncomesDashboard() {
  const [familyIncomes, setFamilyIncomes] = useState<FamilyMemberIncome[]>([]);
  const [isAddIncomeDialogOpen, setAddIncomeDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleAddIncome = async (income: Omit<FamilyMemberIncome, "id">) => {
    try {
      await addDoc(collection(db, "familyIncomes"), income);
      toast({
        title: "Sucesso!",
        description: "Renda adicionada com sucesso.",
      });
    } catch (error) {
       console.error("Erro ao adicionar renda: ", error);
       toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível adicionar a renda.",
      });
    }
  };
  
  const totalFamilyIncome = familyIncomes.reduce((sum, person) => sum + person.income, 0);

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
                <SidebarMenuButton isActive>
                  <Users />
                  <span>Rendas</span>
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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Renda Familiar</h2>
                    <p className="text-muted-foreground">Gerencie a renda de cada membro da família.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setAddIncomeDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Renda
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
                        <CardTitle>Renda Total da Família</CardTitle>
                        <CardDescription>A soma de todas as rendas cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">
                           {totalFamilyIncome.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Membros da Família</CardTitle>
                        <CardDescription>Lista de membros e suas rendas mensais.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-right">Renda Mensal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {familyIncomes.map((person) => (
                            <TableRow key={person.id}>
                                <TableCell className="font-medium">{person.name}</TableCell>
                                <TableCell className="text-right font-medium text-primary">
                                    {person.income.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
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
      <AddIncomeDialog
        open={isAddIncomeDialogOpen}
        onOpenChange={setAddIncomeDialogOpen}
        onAddIncome={handleAddIncome}
      />
    </SidebarProvider>
  );
}
