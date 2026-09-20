import type { BatchSummary } from "../../lib/api";
import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface Props {
  batch: BatchSummary;
  downloadUrl: string;
}

export default function BatchCard({ batch, downloadUrl }: Props) {
  const date = new Date(batch.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = new Date(batch.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="card fade-up"
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Left info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span
            style={{
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: 15,
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {batch.originalName}
          </span>
          <StatusBadge status={batch.status} />
        </div>
        <div style={{ display: "flex", gap: 20, color: "var(--text-muted)", fontSize: 12 }}>
          <span>
            <strong style={{ color: "var(--text-secondary)" }}>{batch.certificateCount}</strong> certificates
          </span>
          <span>
            {date} · {time}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            {batch.id.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href={`/batches/${batch.id}`}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: "7px 14px" }}
        >
          View
        </Link>
        {batch.status === "done" && (
          <a
            href={downloadUrl}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: "7px 14px" }}
          >
            ↓ ZIP
          </a>
        )}
      </div>
    </div>
  );
}
