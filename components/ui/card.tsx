import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-hairline border-line bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn("p-5 md:p-6", className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border-b-hairline border-line px-5 py-4 md:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
