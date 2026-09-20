const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4500/api/certificates";

export interface CandidatePreview {
  row: number;
  candidateName: string;
  courseName: string;
  certificateNumber: string;
  certificateDate: string;
  qualification: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
}

export interface UploadResponse {
  success: boolean;
  batchId: string;
  count: number;
  candidates: CandidatePreview[];
}

export interface GeneratedCert {
  id: string;
  certificateNumber: string;
  candidateName: string;
  courseName: string;
  pdfPath: string;
}

export interface GenerateResponse {
  success: boolean;
  batchId: string;
  generated: number;
  zipPath: string;
  certificates: GeneratedCert[];
}

export interface Certificate {
  id: string;
  candidateName: string;
  courseName: string;
  certificateNumber: string;
  certificateDate: string;
  qualification: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  pdfPath: string | null;
  batchId: string | null;
  createdAt: string;
}

export interface BatchSummary {
  id: string;
  originalName: string;
  status: "uploaded" | "generating" | "done" | "error";
  count: number;
  certificateCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchListResponse {
  success: boolean;
  count: number;
  batches: BatchSummary[];
}

export interface BatchDetailResponse {
  success: boolean;
  batchId: string;
  count: number;
  certificates: Certificate[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function uploadExcel(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error ?? "Upload failed");
  }
  return res.json();
}

export async function generateBatch(batchId: string): Promise<GenerateResponse> {
  const res = await fetch(`${BASE}/generate/${batchId}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error ?? "Generation failed");
  }
  return res.json();
}

export async function listBatches(): Promise<BatchListResponse> {
  const res = await fetch(`${BASE}/batches`);
  if (!res.ok) throw new Error("Failed to load batches");
  return res.json();
}

export async function getBatchCertificates(batchId: string): Promise<BatchDetailResponse> {
  const res = await fetch(`${BASE}/batch/${batchId}`);
  if (!res.ok) throw new Error("Failed to load batch certificates");
  return res.json();
}

export function downloadBatchUrl(batchId: string): string {
  return `${BASE}/batch/${batchId}/download`;
}

export function downloadCertUrl(certId: string): string {
  return `${BASE}/${certId}/download`;
}
