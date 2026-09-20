"use client";
import { useRef, useState } from "react";

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
        border: `2px dashed ${drag ? "var(--gold)" : "var(--border-hover)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "60px 40px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: drag ? "var(--gold-dim)" : "var(--bg-card)",
        transition: "all 0.2s",
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
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Parsing your Excel file…</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
          <p
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Drop your Excel file here
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Supports .xlsx and .xls — up to 20 MB
          </p>
          <span className="btn btn-ghost" style={{ pointerEvents: "none" }}>
            Browse Files
          </span>
          <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 12 }}>
            Required columns: <strong style={{ color: "var(--text-secondary)" }}>Name</strong>,{" "}
            <strong style={{ color: "var(--text-secondary)" }}>Course</strong>,{" "}
            <strong style={{ color: "var(--text-secondary)" }}>Date</strong>
          </p>
        </>
      )}
    </div>
  );
}
