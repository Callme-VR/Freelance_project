import Link from "next/link";
import Navbar from "./components/Navbar";
import { listBatches, downloadBatchUrl } from "../lib/api";
import BatchCard from "./components/BatchCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let batches: Awaited<ReturnType<typeof listBatches>>["batches"] = [];
  let error: string | null = null;

  try {
    const data = await listBatches();
    batches = data.batches;
  } catch {
    error = "Could not connect to the API. Make sure the backend is running on port 4500.";
  }

  const done = batches.filter((b) => b.status === "done").length;
  const totalCerts = batches.reduce((s, b) => s + b.certificateCount, 0);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,192,64,0.12) 0%, transparent 70%)",
          padding: "72px 24px 56px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 99,
            background: "var(--gold-dim)",
            border: "1px solid rgba(240,192,64,0.25)",
            fontSize: 13,
            color: "var(--gold)",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          🎓 Certificate Management System
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            color: "var(--text-primary)",
          }}
        >
          Generate certificates
          <br />
          <span className="gradient-text">in seconds, not hours.</span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 18,
            maxWidth: 540,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Upload your Excel roster, preview candidates, and generate
          professional PDF certificates in bulk — then download them all as a ZIP.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/upload" className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
            🚀 Upload Excel File
          </Link>
          <Link href="/batches" className="btn btn-ghost" style={{ fontSize: 15, padding: "12px 28px" }}>
            View History
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {[
            { label: "Total Batches", value: batches.length, icon: "📋" },
            { label: "Completed Batches", value: done, icon: "✅" },
            { label: "Certificates Generated", value: totalCerts, icon: "🏆" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--gold-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent batches */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Recent Batches
          </h2>
          {batches.length > 5 && (
            <Link href="/batches" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
              View all →
            </Link>
          )}
        </div>

        {error && (
          <div
            className="card"
            style={{
              padding: 20,
              borderColor: "rgba(248,113,113,0.3)",
              color: "var(--danger)",
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {!error && batches.length === 0 && (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 20 }}>
              No batches yet. Upload your first Excel file to get started.
            </p>
            <Link href="/upload" className="btn btn-primary">
              Upload Now
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 60 }}>
          {batches.slice(0, 5).map((b) => (
            <BatchCard key={b.id} batch={b} downloadUrl={downloadBatchUrl(b.id)} />
          ))}
        </div>
      </div>
    </>
  );
}
