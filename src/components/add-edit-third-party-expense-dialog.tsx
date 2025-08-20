"use client";

import { useEffect } from "react";
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
import type { ThirdPartyExpense } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  description: z.string().min(2, "A descrição deve ter no mínimo 2 caracteres."),
  amount: z.coerce.number().positive("O valor deve ser um número positivo."),
});

type AddEditThirdPartyExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Omit<ThirdPartyExpense, "id"> | ThirdPartyExpense) => void;
  expense?: ThirdPartyExpense;
};

export function AddEditThirdPartyExpenseDialog({
  open,
  onOpenChange,
  onSave,
  expense,
}: AddEditThirdPartyExpenseDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
    },
  });

  useEffect(() => {
    if (open && expense) {
      form.reset(expense);
    } else if (open && !expense) {
      form.reset({
        name: "",
        description: "",
        amount: 0,
      });
    }
  }, [open, expense, form]);
  

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (expense) {
      onSave({ ...expense, ...values });
    } else {
      onSave(values);
    }
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Editar Despesa" : "Adicionar Despesa"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Pessoa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Carlos, Ana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Gasto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Almoço, Cinema" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
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
              <Button type="submit" className="bg-primary hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
