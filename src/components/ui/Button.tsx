import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "neutral";

const variantStyles: Record<Variant, string> = {
  success: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",
  warning: "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
  danger: "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20",
  neutral: "text-sky-400 bg-sky-500/10 hover:bg-sky-500/20",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({
  variant = "neutral",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
