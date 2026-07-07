"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ActionButton({ 
  action, 
  id, 
  label,
  confirmMessage,
  variant = "secondary",
  className
}: { 
  action: (id: string) => Promise<{ success: boolean; error?: string }>;
  id: string;
  label: string;
  confirmMessage?: string;
  variant?: "primary" | "secondary" | "destructive";
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }
    
    startTransition(async () => {
      const res = await action(id);
      if (!res.success) alert(res.error);
    });
  };

  return (
    <Button variant={variant} disabled={isPending} onClick={handleAction} className={className}>
      {isPending ? "Processing..." : label}
    </Button>
  );
}
