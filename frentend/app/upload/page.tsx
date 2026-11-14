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
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowLeft,
  Download,
  Plus,
  FileDown,
  Loader2,
} from "lucide-react";

type Step = "upload" | "preview" | "generate" | "done";

export default function UploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [uploading, setUploading] = useState(false);
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
      setError(e instanceof Error ? e.message : "Failed to process the uploaded Excel file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!uploadData) return;
    setError(null);
    setStep("generate");
    try {
      const data = await generateBatch(uploadData.batchId);
      setGenData(data);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Batch generation encountered an error.");
      setStep("preview");
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

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
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
            Import an Excel roster, review and verify candidate fields, then generate certificates in batch.
          </p>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 580,
            marginBottom: 36,
          }}
        >
          {(["Upload", "Review Roster", "Generating", "Complete"] as const).map((label, i) => {
            const isDone = i < stepIndex;
            const isActive = i === stepIndex;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      background: isDone
                        ? "var(--success)"
                        : isActive
                        ? "var(--gold)"
                        : "var(--bg-card)",
                      color: isDone || isActive ? "#080c18" : "var(--text-muted)",
                      border: `1px solid ${isDone ? "var(--success)" : isActive ? "var(--gold)" : "var(--border)"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {isDone ? <Check size={16} strokeWidth={2.5} /> : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isActive ? "var(--gold)" : isDone ? "var(--text-primary)" : "var(--text-muted)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: isDone ? "var(--success)" : "var(--border)",
                      margin: "0 12px",
                      marginBottom: 20,
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className="card"
            style={{
              padding: "14px 18px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderColor: "rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#fca5a5",
              fontSize: 14,
            }}
          >
            <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
            <span>{error}</span>
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
            <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileSpreadsheet size={18} style={{ color: "var(--gold)" }} />
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {fileName}
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {uploadData.count} candidate record{uploadData.count !== 1 ? "s" : ""} verified. Ready to issue.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 13 }}>
                    <ArrowLeft size={14} />
                    Choose Different File
                  </button>
                  <button onClick={handleGenerate} className="btn btn-primary" style={{ fontSize: 13 }}>
                    <CheckCircle2 size={15} />
                    Issue {uploadData.count} Certificates
                  </button>
                </div>
              </div>
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Loader2 size={44} className="spin" style={{ color: "var(--gold)" }} />
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  Generating Certificates…
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  Assembling PDF documents, rendering typography, and compiling the ZIP archive.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Done ──────────────────────────────────────────────────────── */}
        {step === "done" && genData && (
          <div className="fade-up">
            {/* Success Banner */}
            <div
              className="card"
              style={{
                padding: "24px 28px",
                marginBottom: 24,
                borderColor: "rgba(16, 185, 129, 0.3)",
                background: "rgba(16, 185, 129, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <CheckCircle2 size={24} style={{ color: "var(--success)" }} />
                    <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                      {genData.generated} Certificates Ready
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Batch Reference:{" "}
                    <span
                      style={{
                        fontFamily: "monospace",
                        background: "rgba(255, 255, 255, 0.06)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {genData.batchId}
                    </span>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 13 }}>
                    <Plus size={15} />
                    New Batch
                  </button>
                  <a
                    href={downloadBatchUrl(genData.batchId)}
                    className="btn btn-primary"
                    style={{ fontSize: 13 }}
                  >
                    <Download size={15} />
                    Download ZIP Archive
                  </a>
                </div>
              </div>
            </div>

            {/* Certificates Table */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
                Issued Certificates
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "10px 14px" }}>#</th>
                      <th style={{ textAlign: "left", padding: "10px 14px" }}>Candidate Name</th>
                      <th style={{ textAlign: "left", padding: "10px 14px" }}>Course Title</th>
                      <th style={{ textAlign: "left", padding: "10px 14px" }}>Certificate Number</th>
                      <th style={{ textAlign: "right", padding: "10px 14px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genData.certificates.map((c, i) => (
                      <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px", color: "var(--text-muted)", width: 44 }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {c.candidateName}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>{c.courseName}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "var(--gold)",
                              fontSize: 12,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            {c.certificateNumber}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <a
                            href={`http://localhost:4500/api/certificates/${c.id}/download`}
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: "6px 12px", minHeight: 32 }}
                          >
                            <FileDown size={14} />
                            PDF
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
      </main>
    </>
  );
}
