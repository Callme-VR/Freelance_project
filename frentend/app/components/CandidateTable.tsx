import type { CandidatePreview } from "../../lib/api";

interface Props {
  candidates: CandidatePreview[];
}

export default function CandidateTable({ candidates }: Props) {
  return (
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
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <tr key={i}>
              <td style={{ color: "var(--text-muted)", width: 40 }}>{c.row}</td>
              <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.candidateName}</td>
              <td>{c.courseName}</td>
              <td>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: c.certificateNumber === "(auto-generate)" ? "var(--text-muted)" : "var(--gold)",
                    fontStyle: c.certificateNumber === "(auto-generate)" ? "italic" : "normal",
                  }}
                >
                  {c.certificateNumber}
                </span>
              </td>
              <td>{c.certificateDate}</td>
              <td>{c.qualification ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
              <td>{c.email ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
              <td>{c.organization ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
