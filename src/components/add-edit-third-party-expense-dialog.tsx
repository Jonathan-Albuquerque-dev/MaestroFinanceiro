"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ThirdPartyExpense, CreditCard } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  description: z.string().min(2, "A descrição deve ter no mínimo 2 caracteres."),
  amount: z.coerce.number().positive("O valor deve ser um número positivo."),
  paymentMethod: z.enum(["dinheiro", "pix", "debito", "credito"]),
  creditCardId: z.string().optional(),
  installments: z.coerce.number().int().min(1).optional(),
}).refine(data => {
    if (data.paymentMethod === 'credito' && !data.creditCardId) {
        return false;
    }
    return true;
}, {
    message: "Cartão de crédito é obrigatório para essa forma de pagamento.",
    path: ["creditCardId"],
});


type AddEditThirdPartyExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Omit<ThirdPartyExpense, "id"> | ThirdPartyExpense) => void;
  expense?: ThirdPartyExpense;
  creditCards: CreditCard[];
};

export function AddEditThirdPartyExpenseDialog({
  open,
  onOpenChange,
  onSave,
  expense,
  creditCards,
}: AddEditThirdPartyExpenseDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      paymentMethod: "dinheiro",
      installments: 1,
    },
  });

   const paymentMethod = useWatch({
      control: form.control,
      name: "paymentMethod"
  });

  useEffect(() => {
    if (open && expense) {
      form.reset(expense);
    } else if (open && !expense) {
      form.reset({
        name: "",
        description: "",
        amount: 0,
        paymentMethod: "dinheiro",
        installments: 1,
        creditCardId: undefined,
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
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Meio de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione o meio de pagamento" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">Pix</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
              )}
            />
            {paymentMethod === 'credito' && (
                <>
                    <FormField
                        control={form.control}
                        name="creditCardId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cartão de Crédito</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o cartão" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {creditCards.map((card) => (
                                    <SelectItem key={card.id} value={card.id}>
                                    {card.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                      <FormField
                        control={form.control}
                        name="installments"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
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
