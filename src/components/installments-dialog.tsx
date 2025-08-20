"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MemberExpense } from "@/lib/types";

type InstallmentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: MemberExpense;
  onUpdateInstallments: (expenseId: string, paidInstallments: number[]) => void;
};

export function InstallmentsDialog({
  open,
  onOpenChange,
  expense,
  onUpdateInstallments,
}: InstallmentsDialogProps) {
  const [paid, setPaid] = useState<number[]>(expense.paidInstallments || []);

  useEffect(() => {
    setPaid(expense.paidInstallments || []);
  }, [expense]);

  const handleSave = () => {
    onUpdateInstallments(expense.id, paid);
    onOpenChange(false);
  };

  const handleCheckboxChange = (installmentNumber: number, checked: boolean) => {
    setPaid(prevPaid => {
      if (checked) {
        return [...prevPaid, installmentNumber];
      } else {
        return prevPaid.filter(p => p !== installmentNumber);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Controle de Parcelas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Marque as parcelas que já foram pagas para a despesa "{expense.description}".
          </p>
          <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
            {Array.from({ length: expense.installments || 0 }, (_, i) => i + 1).map(
              (installmentNumber) => (
                <div key={installmentNumber} className="flex items-center space-x-2">
                  <Checkbox
                    id={`installment-${installmentNumber}`}
                    checked={paid.includes(installmentNumber)}
                    onCheckedChange={(checked) => handleCheckboxChange(installmentNumber, !!checked)}
                  />
                  <Label
                    htmlFor={`installment-${installmentNumber}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Parcela {installmentNumber}
                  </Label>
                </div>
              )
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
