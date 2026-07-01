import { cn } from "@/lib/utils";

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export default function AdminTextarea({ className, label, ...props }: AdminTextareaProps) {
  return (
    <label className="block">
      {label ? <span className="label-mono mb-2 block">{label}</span> : null}
      <textarea
        className={cn(
          "w-full resize-none border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-0 placeholder:text-on-surface-variant/50",
          className,
        )}
        {...props}
      />
    </label>
  );
}
