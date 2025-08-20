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
import type { CreditCard } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  closingDate: z.coerce.number().int().min(1, "O dia deve ser entre 1 e 31.").max(31, "O dia deve ser entre 1 e 31."),
  dueDate: z.coerce.number().int().min(1, "O dia deve ser entre 1 e 31.").max(31, "O dia deve ser entre 1 e 31."),
});

type AddEditCreditCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: Omit<CreditCard, "id"> | CreditCard) => void;
  card?: CreditCard;
};

export function AddEditCreditCardDialog({
  open,
  onOpenChange,
  onSave,
  card,
}: AddEditCreditCardDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      closingDate: 1,
      dueDate: 10,
    },
  });

  useEffect(() => {
    if (open && card) {
      form.reset(card);
    } else if (open && !card) {
      form.reset({
        name: "",
        closingDate: 1,
        dueDate: 10,
      });
    }
  }, [open, card, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (card) {
      onSave({ ...card, ...values });
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
          <DialogTitle>{card ? "Editar Cartão" : "Adicionar Cartão"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank, Inter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do Fechamento</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do Vencimento</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 05" {...field} />
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
