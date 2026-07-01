import { cn } from "@/lib/utils";

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function AdminButton({ className, variant = "secondary", children, type = "button", ...props }: AdminButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-label-mono uppercase tracking-widest transition duration-300",
        variant === "primary" && "bg-primary px-6 py-3 text-background hover:bg-on-surface",
        variant === "secondary" && "border border-outline-variant/30 px-6 py-3 text-on-surface hover:bg-surface-container",
        variant === "ghost" && "text-on-surface-variant hover:text-on-surface",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
