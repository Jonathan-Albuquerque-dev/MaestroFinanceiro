"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FamilyMemberIncome } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  income: z.coerce.number().positive("A renda deve ser um valor positivo."),
});

type AddIncomeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome: (income: Omit<FamilyMemberIncome, "id">) => void;
};

export function AddIncomeDialog({
  open,
  onOpenChange,
  onAddIncome,
}: AddIncomeDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      income: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddIncome(values);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Renda Familiar</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Membro</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João, Maria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renda Mensal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="R$ 0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Adicionar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
