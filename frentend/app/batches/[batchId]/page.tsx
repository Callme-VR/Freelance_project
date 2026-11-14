import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import { getBatchCertificates, downloadBatchUrl, downloadCertUrl } from "../../../lib/api";
import Link from "next/link";
import { ChevronRight, Download, AlertTriangle, FileDown, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ batchId: string }>;
}

export default async function BatchDetailPage({ params }: Props) {
  const { batchId } = await params;

  let certificates: Awaited<ReturnType<typeof getBatchCertificates>>["certificates"] = [];
  let error: string | null = null;

  try {
    const data = await getBatchCertificates(batchId);
    certificates = data.certificates;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load batch records";
  }

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <Link href="/batches" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            Batch History
          </Link>
          <ChevronRight size={14} />
          <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
            {batchId.slice(0, 16)}…
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Batch Records
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StatusBadge status={error ? "error" : "done"} />
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} in this batch
              </span>
            </div>
          </div>
          {!error && certificates.length > 0 && (
            <a
              href={downloadBatchUrl(batchId)}
              className="btn btn-primary"
              style={{ fontSize: 14 }}
            >
              <Download size={15} />
              Download All (ZIP)
            </a>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="card"
            style={{
              padding: "16px 20px",
              borderColor: "rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#fca5a5",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
              <span>{error}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Link href="/batches" className="btn btn-ghost" style={{ fontSize: 13 }}>
                <ArrowLeft size={14} />
                Back to History
              </Link>
            </div>
          </div>
        )}

        {/* Certificates Table */}
        {!error && certificates.length > 0 && (
          <div className="card fade-up" style={{ padding: "20px 24px" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>#</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Candidate Name</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Course Title</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Certificate Number</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Certificate Date</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Qualification</th>
                    <th style={{ textAlign: "left", padding: "12px 14px" }}>Organization</th>
                    <th style={{ textAlign: "right", padding: "12px 14px" }}>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c, i) => {
                    const certDate = new Date(c.certificateDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px", color: "var(--text-muted)", width: 44 }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {c.candidateName}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>{c.courseName}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "var(--gold)",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            {c.certificateNumber}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {certDate}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                          {c.qualification ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                          {c.organization ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <a
                            href={downloadCertUrl(c.id)}
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: "6px 12px", minHeight: 32 }}
                          >
                            <FileDown size={14} />
                            PDF
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
