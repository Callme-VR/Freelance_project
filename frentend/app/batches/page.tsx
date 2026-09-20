import Navbar from "../components/Navbar";
import BatchCard from "../components/BatchCard";
import { listBatches, downloadBatchUrl } from "../../lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  let batches: Awaited<ReturnType<typeof listBatches>>["batches"] = [];
  let error: string | null = null;

  try {
    const data = await listBatches();
    batches = data.batches;
  } catch {
    error = "Could not reach the API. Ensure the backend is running on port 4500.";
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
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
              All uploaded Excel batches and their generated certificates.
            </p>
          </div>
          <Link href="/upload" className="btn btn-primary">
            + New Upload
          </Link>
        </div>

        {/* Stats row */}
        {!error && batches.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
                style={{ padding: "14px 18px" }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
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
              padding: 20,
              borderColor: "rgba(248,113,113,0.3)",
              color: "var(--danger)",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Empty */}
        {!error && batches.length === 0 && (
          <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 24 }}>
              No batches found. Upload your first Excel file to get started.
            </p>
            <Link href="/upload" className="btn btn-primary">
              Upload Now
            </Link>
          </div>
        )}

        {/* Batch list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {batches.map((b) => (
            <BatchCard key={b.id} batch={b} downloadUrl={downloadBatchUrl(b.id)} />
          ))}
        </div>
      </div>
    </>
  );
}
