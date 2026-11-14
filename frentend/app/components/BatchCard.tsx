import type { BatchSummary } from "../../lib/api";
import StatusBadge from "./StatusBadge";
import Link from "next/link";
import { FileSpreadsheet, Download, ChevronRight, Calendar, Users } from "lucide-react";

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
      className="card"
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* File & Status */}
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              color: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={16} />
          </div>
          <span
            style={{
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: 14,
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {batch.originalName}
          </span>
          <StatusBadge status={batch.status} />
        </div>

        {/* Metadata Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "var(--text-muted)",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Users size={13} />
            <strong className="tabular-nums" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              {batch.certificateCount}
            </strong>{" "}
            records
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Calendar size={13} />
            <span className="tabular-nums">{date}</span> · <span className="tabular-nums">{time}</span>
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "1px 6px",
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            #{batch.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Action Strip */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link
          href={`/batches/${batch.id}`}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: "6px 14px", minHeight: 34 }}
        >
          Inspect
          <ChevronRight size={14} />
        </Link>
        {batch.status === "done" && (
          <a
            href={downloadUrl}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: "6px 14px", minHeight: 34 }}
          >
            <Download size={14} />
            Download ZIP
          </a>
        )}
      </div>
    </div>
  );
}
