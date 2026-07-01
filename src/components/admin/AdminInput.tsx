import { cn } from "@/lib/utils";

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function AdminInput({ className, label, ...props }: AdminInputProps) {
  return (
    <label className="block">
      {label ? <span className="label-mono mb-2 block">{label}</span> : null}
      <input
        className={cn(
          "w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-0 placeholder:text-on-surface-variant/50",
          className,
        )}
        {...props}
      />
    </label>
  );
}
