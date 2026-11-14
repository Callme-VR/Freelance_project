import type { CandidatePreview } from "../../lib/api";
import { Users } from "lucide-react";

interface Props {
  candidates: CandidatePreview[];
}

export default function CandidateTable({ candidates }: Props) {
  if (candidates.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          background: "var(--bg-card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <Users size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
        <p style={{ fontSize: 14 }}>No candidate records found in this sheet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>#</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Candidate Name</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Course Title</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Certificate ID</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Issue Date</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Qualification</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Email</th>
            <th style={{ textAlign: "left", padding: "12px 16px" }}>Organization</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "12px 16px", color: "var(--text-muted)", width: 44 }}>{c.row}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{c.candidateName}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.courseName}</td>
              <td style={{ padding: "12px 16px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: c.certificateNumber === "(auto-generate)" ? "var(--text-muted)" : "var(--gold)",
                    fontStyle: c.certificateNumber === "(auto-generate)" ? "italic" : "normal",
                  }}
                >
                  {c.certificateNumber}
                </span>
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                {c.certificateDate}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                {c.qualification ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                {c.email ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                {c.organization ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
