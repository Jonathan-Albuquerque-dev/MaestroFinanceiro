"use client";

import { useState, useTransition } from "react";
import { Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { runGetSavingsTips } from "@/lib/actions";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

export function SavingsTips({ transactions }: { transactions: Transaction[] }) {
  const [tips, setTips] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateTips = () => {
    const spendingData = transactions
      .filter((t) => t.type === "expense")
      .map((t) => `${t.description}: R$${t.amount} em ${t.category}`)
      .join(", ");

    if (!spendingData) {
      toast({
        variant: "destructive",
        title: "Ops!",
        description: "Você precisa de despesas para gerar dicas.",
      });
      return;
    }

    startTransition(async () => {
      const result = await runGetSavingsTips(spendingData);
      if ("savingsTips" in result) {
        setTips(result.savingsTips);
        toast({
          title: "Novas dicas chegaram!",
          description: "Confira suas novas sugestões de economia.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error || "Não foi possível gerar as dicas.",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dicas de Economia com IA</CardTitle>
        <CardDescription>
          Receba sugestões personalizadas para otimizar suas finanças.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        ) : tips.length > 0 ? (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-1 flex-shrink-0 text-accent" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground h-full">
            <p>Clique no botão abaixo para gerar dicas de economia baseadas nos seus gastos.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateTips} disabled={isPending} className="w-full bg-accent hover:bg-accent/90">
          {isPending ? "Gerando..." : "Gerar Novas Dicas"}
        </Button>
      </CardFooter>
    </Card>
  );
}
