import Link from "next/link";
import Navbar from "./components/Navbar";
import { listBatches, downloadBatchUrl } from "../lib/api";
import BatchCard from "./components/BatchCard";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Award,
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  Activity,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let batches: Awaited<ReturnType<typeof listBatches>>["batches"] = [];
  let error: string | null = null;

  try {
    const data = await listBatches();
    batches = data.batches;
  } catch {
    error = "Could not establish connection to the certificate processing service.";
  }

  const doneCount = batches.filter((b) => b.status === "done").length;
  const totalCerts = batches.reduce((s, b) => s + b.certificateCount, 0);

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Executive Command Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingBottom: 24,
            borderBottom: "1px solid var(--border)",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--gold)",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Activity size={13} />
              Operations Dashboard
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Certificate Generation
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 6, margin: 0 }}>
              Batch issuance pipeline, candidate rosters, and generated credential packages.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/batches"
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: "7px 14px", minHeight: 36 }}
            >
              <Layers size={14} />
              All Batches
            </Link>
            <Link
              href="/upload"
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "7px 16px", minHeight: 36 }}
            >
              <UploadCloud size={15} strokeWidth={2.5} />
              Import Roster
            </Link>
          </div>
        </div>

        {/* Architectural Metrics Strip */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 1,
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            marginBottom: 36,
          }}
        >
          {/* Metric 1 */}
          <div style={{ background: "var(--bg-surface)", padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Total Batches
              </span>
              <FileSpreadsheet size={16} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {batches.length}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Ingested spreadsheet files
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{ background: "var(--bg-surface)", padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Completed Runs
              </span>
              <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {doneCount}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {batches.length > 0
                ? `${Math.round((doneCount / batches.length) * 100)}% completion rate`
                : "Awaiting first run"}
            </div>
          </div>

          {/* Metric 3 */}
          <div style={{ background: "var(--bg-surface)", padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Credentials Issued
              </span>
              <Award size={16} style={{ color: "var(--gold)" }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
              {totalCerts}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Verified candidate records
            </div>
          </div>

          {/* Metric 4 */}
          <div style={{ background: "var(--bg-surface)", padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Engine Status
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: error ? "var(--danger)" : "var(--success)",
                  boxShadow: error ? "none" : "0 0 8px rgba(16, 185, 129, 0.4)",
                }}
              />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: error ? "var(--danger)" : "var(--text-primary)", lineHeight: 1.2 }}>
              {error ? "Offline" : "Ready"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              {error ? "Service unreachable" : "PDF generation service active"}
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderColor: "rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#fca5a5",
              fontSize: 13,
              marginBottom: 28,
            }}
          >
            <AlertTriangle size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Layout: Asymmetric Work Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
          {/* Recent Batches Section */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Recent Batches
                </h2>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 7px",
                    borderRadius: 99,
                    background: "rgba(255, 255, 255, 0.06)",
                    color: "var(--text-muted)",
                  }}
                >
                  {batches.length}
                </span>
              </div>
              {batches.length > 5 && (
                <Link
                  href="/batches"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--gold)",
                    textDecoration: "none",
                  }}
                >
                  View full history <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {/* Empty State */}
            {!error && batches.length === 0 && (
              <div
                className="card"
                style={{
                  padding: "56px 24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    No Batches Created Yet
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 380, margin: "0 auto" }}>
                    Import an Excel file containing candidate names, courses, and dates to generate your first batch.
                  </p>
                </div>
                <Link href="/upload" className="btn btn-primary" style={{ marginTop: 8 }}>
                  <UploadCloud size={14} />
                  Import First Roster
                </Link>
              </div>
            )}

            {/* Batch List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {batches.slice(0, 8).map((b) => (
                <BatchCard key={b.id} batch={b} downloadUrl={downloadBatchUrl(b.id)} />
              ))}
            </div>
          </section>

          {/* Quick Roster Import Callout */}
          <section
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-subtle)",
              borderColor: "var(--border)",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <UploadCloud size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  Need to issue a new set of certificates?
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, maxWidth: 540 }}>
                  Upload any <code style={{ color: "var(--text-primary)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3 }}>.xlsx</code> or <code style={{ color: "var(--text-primary)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3 }}>.xls</code> roster with Name, Course, and Date columns.
                </p>
              </div>
            </div>
            <Link href="/upload" className="btn btn-primary" style={{ padding: "8px 18px" }}>
              Start Batch Import
              <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
