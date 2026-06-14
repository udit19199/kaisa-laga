import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  error?: string | null;
  variant?: "marketing" | "default";
};

export function AuthField({
  id,
  label,
  children,
  error,
  variant = "marketing",
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className={cn(
          variant === "marketing" && "font-medium text-marketing-ink",
        )}
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
