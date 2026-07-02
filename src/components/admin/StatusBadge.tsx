"use client";

import type { PostStatus } from "@/data/cms";
import { useAdminI18n } from "@/i18n/admin";

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
  const { dictionary } = useAdminI18n();
  const tone = statusTone[status];
  const [dotClass, textClass] = tone.split(" ");
  const label =
    status === "draft"
      ? dictionary.editor.draft
      : status === "published"
        ? dictionary.editor.published
        : status === "scheduled"
          ? dictionary.editor.scheduled
          : status;

  return (
    <span className="inline-flex items-center gap-2 font-mono text-label-mono uppercase tracking-widest">
      <span className={`size-1.5 rounded-full ${dotClass}`} />
      <span className={textClass}>{label}</span>
    </span>
  );
}
