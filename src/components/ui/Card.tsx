import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
