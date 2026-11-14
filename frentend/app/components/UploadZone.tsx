"use client";
import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  loading?: boolean;
}

export default function UploadZone({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${drag ? "var(--gold)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "56px 32px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: drag ? "var(--gold-dim)" : "var(--bg-card)",
        transition: "all 0.2s ease",
        userSelect: "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Loader2 size={36} className="spin" style={{ color: "var(--gold)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 500 }}>
            Parsing roster workbook…
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 20px",
              borderRadius: 16,
              background: "rgba(245, 158, 11, 0.12)",
              color: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadCloud size={32} />
          </div>
          <p
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 6,
            }}
          >
            Drop your candidate roster here
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Accepted formats: .xlsx or .xls (up to 20 MB)
          </p>
          <span className="btn btn-ghost" style={{ pointerEvents: "none" }}>
            <FileSpreadsheet size={16} />
            Browse Files
          </span>
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            Expected columns: <strong style={{ color: "var(--text-secondary)" }}>Name</strong>,{" "}
            <strong style={{ color: "var(--text-secondary)" }}>Course</strong>,{" "}
            <strong style={{ color: "var(--text-secondary)" }}>Date</strong>
          </div>
        </>
      )}
    </div>
  );
}
