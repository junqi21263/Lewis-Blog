import type { PostStatus } from "@/data/cms";

type AdminStatus = "review" | "processing";
type StatusBadgeValue = AdminStatus | PostStatus;

const statusTone: Record<StatusBadgeValue, string> = {
  published: "bg-primary text-primary",
  draft: "bg-secondary text-secondary",
  scheduled: "bg-outline text-outline",
  archived: "bg-outline-variant text-on-surface-variant",
  review: "bg-on-surface-variant text-on-surface-variant",
  processing: "bg-outline-variant text-on-surface-variant",
};

type StatusBadgeProps = {
  status: StatusBadgeValue;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const tone = statusTone[status];
  const [dotClass, textClass] = tone.split(" ");

  return (
    <span className="inline-flex items-center gap-2 font-mono text-label-mono uppercase tracking-widest">
      <span className={`size-1.5 rounded-full ${dotClass}`} />
      <span className={textClass}>{status}</span>
    </span>
  );
}
