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
import { AddEditCreditCardDialog } from "./add-edit-credit-card-dialog";
import type { CreditCard as CreditCardType } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function CreditCardsDashboard() {
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | undefined>(undefined);
  const { toast } = useToast();

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
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Cartões de Crédito</h2>
                    <p className="text-muted-foreground">Gerencie seus cartões de crédito.</p>
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

            <main className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Seus Cartões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nome do Cartão</TableHead>
                            <TableHead>Data de Fechamento</TableHead>
                            <TableHead>Data de Vencimento</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {creditCards.map((card) => (
                            <TableRow key={card.id}>
                                <TableCell className="font-medium">{card.name}</TableCell>
                                <TableCell>Dia {card.closingDate}</TableCell>
                                <TableCell>Dia {card.dueDate}</TableCell>
                                <TableCell>
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
      <AddEditCreditCardDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddOrUpdate}
        card={selectedCard}
      />
    </SidebarProvider>
  );
}
