"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ThirdPartyExpense } from "@/lib/types";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ViewInstallmentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ThirdPartyExpense;
  onUpdateInstallments: (expenseId: string, paidInstallments: number[]) => void;
};

export function ViewInstallmentsDialog({
  open,
  onOpenChange,
  expense,
  onUpdateInstallments,
}: ViewInstallmentsDialogProps) {
  const [paidInstallments, setPaidInstallments] = useState<number[]>(expense.paidInstallments || []);

  useEffect(() => {
    if (open) {
      setPaidInstallments(expense.paidInstallments || []);
    }
  }, [open, expense.paidInstallments]);

  const handleCheckboxChange = (installmentNumber: number) => {
    setPaidInstallments(prev =>
      prev.includes(installmentNumber)
        ? prev.filter(n => n !== installmentNumber)
        : [...prev, installmentNumber]
    );
  };
  
  const handleSaveChanges = () => {
    onUpdateInstallments(expense.id, paidInstallments);
    onOpenChange(false);
  }

  const installments = expense.installments || 1;
  const installmentAmount = expense.amount / installments;
  const expenseDate = typeof expense.date === 'string' ? new Date(expense.date) : expense.date.toDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parcelas de {expense.description}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {Array.from({ length: installments }, (_, i) => {
                 const installmentNumber = i + 1;
                 const dueDate = addMonths(expenseDate, i);
                return (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Checkbox
                                id={`installment-${i}`}
                                checked={paidInstallments.includes(installmentNumber)}
                                onCheckedChange={() => handleCheckboxChange(installmentNumber)}
                            />
                            <Label htmlFor={`installment-${i}`} className="text-base">
                                Parcela {installmentNumber}
                            </Label>
                        </div>
                        <div className="text-right">
                             <p className="font-medium">
                                {installmentAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                             </p>
                            <p className="text-sm text-muted-foreground">
                                Vencimento: {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
        <Separator />
         <div className="flex justify-between items-center pt-2">
            <p className="font-bold">Total Pago:</p>
            <p className="font-bold text-primary">
                {(paidInstallments.length * installmentAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
         </div>
         <div className="flex justify-between items-center">
            <p className="font-bold">Total Restante:</p>
            <p className="font-bold text-destructive">
                {((installments - paidInstallments.length) * installmentAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
         </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
