import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import { getBatchCertificates, downloadBatchUrl, downloadCertUrl } from "../../../lib/api";
import Link from "next/link";

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
    error = e instanceof Error ? e.message : "Failed to load batch";
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
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
            History
          </Link>
          <span>›</span>
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
              Batch Detail
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StatusBadge status={error ? "error" : "done"} />
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {!error && certificates.length > 0 && (
            <a
              href={downloadBatchUrl(batchId)}
              className="btn btn-primary"
              style={{ fontSize: 14 }}
            >
              ↓ Download All (ZIP)
            </a>
          )}
        </div>

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
            <div style={{ marginTop: 12 }}>
              <Link href="/batches" className="btn btn-ghost" style={{ fontSize: 13 }}>
                ← Back to History
              </Link>
            </div>
          </div>
        )}

        {/* Certificates table */}
        {!error && certificates.length > 0 && (
          <div className="card fade-up" style={{ padding: "20px 24px" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Cert Number</th>
                    <th>Date</th>
                    <th>Qualification</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Issued</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c, i) => {
                    const issued = new Date(c.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const certDate = new Date(c.certificateDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <tr key={c.id}>
                        <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {c.candidateName}
                        </td>
                        <td>{c.courseName}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "var(--gold)",
                            }}
                          >
                            {c.certificateNumber}
                          </span>
                        </td>
                        <td>{certDate}</td>
                        <td>
                          {c.qualification ?? (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {c.email ?? (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {c.organization ?? (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {issued}
                        </td>
                        <td>
                          <a
                            href={downloadCertUrl(c.id)}
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: "5px 12px" }}
                          >
                            PDF ↓
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
      </div>
    </>
  );
}
