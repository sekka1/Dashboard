import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-slate-900 text-white hover:bg-slate-700",
      outline: "border border-slate-300 bg-white hover:bg-slate-50",
      ghost: "hover:bg-slate-100",
      destructive: "bg-red-600 text-white hover:bg-red-500",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
