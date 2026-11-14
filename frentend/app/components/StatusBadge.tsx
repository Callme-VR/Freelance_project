import React from "react";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "uploaded" | "generating" | "done" | "error";

const CONFIG: Record<Status, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  uploaded: { label: "Uploaded", icon: FileUp },
  generating: { label: "Generating…", icon: Loader2 },
  done: { label: "Done", icon: CheckCircle2 },
  error: { label: "Error", icon: AlertCircle },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as Status] ?? { label: status, icon: FileUp };
  const Icon = cfg.icon;
  const isGenerating = status === "generating";

  return (
    <span className={`badge badge-${status}`}>
      <Icon size={12} className={isGenerating ? "spin" : ""} />
      {cfg.label}
    </span>
  );
}
