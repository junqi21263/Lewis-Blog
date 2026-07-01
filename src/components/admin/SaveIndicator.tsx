type SaveIndicatorProps = {
  status?: string;
};

export default function SaveIndicator({ status = "Draft - Auto-saved 2m ago" }: SaveIndicatorProps) {
  return (
    <span className="rounded-sm border border-outline-variant/20 bg-surface-container px-3 py-1 font-mono text-label-mono text-on-surface-variant">
      {status}
    </span>
  );
}
