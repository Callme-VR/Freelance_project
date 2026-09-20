"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import CandidateTable from "../components/CandidateTable";
import {
  uploadExcel,
  generateBatch,
  downloadBatchUrl,
  type UploadResponse,
  type GenerateResponse,
} from "../../lib/api";

type Step = "upload" | "preview" | "generate" | "done";

export default function UploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [genData, setGenData] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const STEPS = ["upload", "preview", "generate", "done"] as const;
  const stepIndex = STEPS.indexOf(step);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    setUploading(true);
    try {
      const data = await uploadExcel(file);
      setUploadData(data);
      setStep("preview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!uploadData) return;
    setError(null);
    setGenerating(true);
    setStep("generate");
    try {
      const data = await generateBatch(uploadData.batchId);
      setGenData(data);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("preview");
    } finally {
      setGenerating(false);
    }
  }

  function reset() {
    setStep("upload");
    setUploadData(null);
    setGenData(null);
    setError(null);
    setFileName("");
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
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
            New Certificate Batch
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Upload an Excel file, preview the data, then generate all certificates at once.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
          {(["Upload", "Preview", "Generating", "Done"] as const).map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  className={
                    i < stepIndex
                      ? "step-dot step-dot-done"
                      : i === stepIndex
                      ? "step-dot step-dot-active"
                      : "step-dot step-dot-pending"
                  }
                >
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: i === stepIndex ? "var(--gold)" : "var(--text-muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  style={{
                    width: "clamp(40px, 8vw, 100px)",
                    height: 1,
                    background: i < stepIndex ? "var(--success)" : "var(--border)",
                    margin: "0 8px",
                    marginBottom: 20,
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="card"
            style={{
              padding: 16,
              marginBottom: 24,
              borderColor: "rgba(248,113,113,0.3)",
              color: "var(--danger)",
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ── Step: Upload ─────────────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="fade-up">
            <UploadZone onFile={handleFile} loading={uploading} />
          </div>
        )}

        {/* ── Step: Preview ────────────────────────────────────────────────────── */}
        {step === "preview" && uploadData && (
          <div className="fade-up">
            <div
              className="card"
              style={{ padding: "20px 24px", marginBottom: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                    📋 Preview — {fileName}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {uploadData.count} candidate{uploadData.count !== 1 ? "s" : ""} found. Review and confirm.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 13 }}>
                    ← Re-upload
                  </button>
                  <button onClick={handleGenerate} className="btn btn-primary" style={{ fontSize: 13 }}>
                    ⚡ Generate {uploadData.count} Certificates
                  </button>
                </div>
              </div>
              <div className="divider" style={{ marginBottom: 16 }} />
              <CandidateTable candidates={uploadData.candidates} />
            </div>
          </div>
        )}

        {/* ── Step: Generating ────────────────────────────────────────────────── */}
        {step === "generate" && (
          <div className="fade-up">
            <div
              className="card"
              style={{
                padding: "80px 40px",
                textAlign: "center",
              }}
            >
              <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, margin: "0 auto 24px" }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Generating Certificates…
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Creating PDFs and building your ZIP archive. This may take a moment.
              </p>
            </div>
          </div>
        )}

        {/* ── Step: Done ──────────────────────────────────────────────────────── */}
        {step === "done" && genData && (
          <div className="fade-up">
            {/* Success banner */}
            <div
              className="card"
              style={{
                padding: "24px 28px",
                marginBottom: 20,
                borderColor: "rgba(52,211,153,0.3)",
                background: "rgba(52,211,153,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--success)", marginBottom: 4 }}>
                    ✅ {genData.generated} Certificates Generated!
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Batch ID: <span style={{ fontFamily: "monospace" }}>{genData.batchId.slice(0, 16)}…</span>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 13 }}>
                    + New Batch
                  </button>
                  <a
                    href={downloadBatchUrl(genData.batchId)}
                    className="btn btn-primary"
                    style={{ fontSize: 13 }}
                  >
                    ↓ Download All (ZIP)
                  </a>
                </div>
              </div>
            </div>

            {/* Results table */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
                Generated Certificates
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Cert Number</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genData.certificates.map((c, i) => (
                      <tr key={c.id}>
                        <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.candidateName}</td>
                        <td>{c.courseName}</td>
                        <td>
                          <span style={{ fontFamily: "monospace", color: "var(--gold)", fontSize: 12 }}>
                            {c.certificateNumber}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`http://localhost:4500/api/certificates/${c.id}/download`}
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: "5px 12px" }}
                          >
                            PDF ↓
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
