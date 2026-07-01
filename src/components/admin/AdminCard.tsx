import { cn } from "@/lib/utils";

type AdminCardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article";
};

export default function AdminCard({ as = "div", className, children, ...props }: AdminCardProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        "rounded-[20px] border border-outline-variant/10 bg-surface-container-lowest transition duration-500 ease-editorial",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
