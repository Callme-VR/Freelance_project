import Navbar from "../components/Navbar";
import BatchCard from "../components/BatchCard";
import { listBatches, downloadBatchUrl } from "../../lib/api";
import Link from "next/link";
import { Plus, AlertTriangle, FolderX, UploadCloud } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  let batches: Awaited<ReturnType<typeof listBatches>>["batches"] = [];
  let error: string | null = null;

  try {
    const data = await listBatches();
    batches = data.batches;
  } catch {
    error = "Could not reach the certificate service. Ensure the backend server is running.";
  }

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              Batch History
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Review previously uploaded candidate batches, generation status, and archive downloads.
            </p>
          </div>
          <Link href="/upload" className="btn btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            New Batch
          </Link>
        </div>

        {/* Stats Row */}
        {!error && batches.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Total Batches", value: batches.length },
              {
                label: "Completed",
                value: batches.filter((b) => b.status === "done").length,
              },
              {
                label: "Total Certificates",
                value: batches.reduce((s, b) => s + b.certificateCount, 0),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="card"
                style={{ padding: "16px 20px" }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--gold)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="card"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderColor: "rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#fca5a5",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!error && batches.length === 0 && (
          <div
            className="card"
            style={{
              padding: "64px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.04)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <FolderX size={28} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              No batches recorded yet. Upload your first candidate roster.
            </p>
            <Link href="/upload" className="btn btn-primary" style={{ marginTop: 8 }}>
              <UploadCloud size={16} />
              Upload Now
            </Link>
          </div>
        )}

        {/* Batch List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {batches.map((b) => (
            <BatchCard key={b.id} batch={b} downloadUrl={downloadBatchUrl(b.id)} />
          ))}
        </div>
      </main>
    </>
  );
}
