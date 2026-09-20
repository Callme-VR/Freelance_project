type Status = "uploaded" | "generating" | "done" | "error";

const CONFIG: Record<Status, { label: string; icon: string }> = {
  uploaded: { label: "Uploaded", icon: "📂" },
  generating: { label: "Generating…", icon: "⚙️" },
  done: { label: "Done", icon: "✅" },
  error: { label: "Error", icon: "❌" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as Status] ?? { label: status, icon: "•" };
  return (
    <span className={`badge badge-${status}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}
