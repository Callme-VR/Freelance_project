import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { parseExcelFile, type CandidateRow } from "../services/excelParser.js";
import { generateCertificatePdf } from "../services/pdfGenerator.js";
import { buildZip } from "../services/zipBuilder.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const CERT_DIR = path.join(process.cwd(), "certificates");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(CERT_DIR, { recursive: true });

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(xlsx|xls)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx and .xls files are accepted."));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── Helper: auto-generate certificate number ─────────────────────────────────
function genCertNumber(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${y}${m}${d}-${rand}`;
}

// ─── In-memory batch store (backed by temp JSON file) ─────────────────────────
function saveBatchData(batchId: string, candidates: CandidateRow[]): void {
  const batchFile = path.join(UPLOAD_DIR, `${batchId}.json`);
  fs.writeFileSync(
    batchFile,
    JSON.stringify(
      candidates.map((c) => ({
        ...c,
        certificateDate: c.certificateDate.toISOString(),
      })),
      null,
      2
    )
  );
}

function loadBatchData(batchId: string): CandidateRow[] {
  const batchFile = path.join(UPLOAD_DIR, `${batchId}.json`);
  if (!fs.existsSync(batchFile)) {
    throw new Error(`Batch not found: ${batchId}`);
  }
  const raw: Array<Record<string, unknown>> = JSON.parse(
    fs.readFileSync(batchFile, "utf-8")
  );
  return raw.map((r) => ({
    ...r,
    certificateDate: new Date(r.certificateDate as string),
  })) as CandidateRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /batches — List all batches (for history page)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/batches",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const batches = await prisma.batch.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { certificates: true } },
        },
      });

      res.status(200).json({
        success: true,
        count: batches.length,
        batches: batches.map((b) => ({
          id: b.id,
          originalName: b.originalName,
          status: b.status,
          count: b.count,
          certificateCount: b._count.certificates,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        })),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Fetch failed.";
      res.status(500).json({ error: message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /upload — Upload Excel, validate, store parsed data + DB batch record
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const candidates = parseExcelFile(req.file.path);
      const batchId = uuidv4();

      // Persist batch record in DB
      await prisma.batch.create({
        data: {
          id: batchId,
          originalName: req.file.originalname,
          status: "uploaded",
          count: candidates.length,
        },
      });

      saveBatchData(batchId, candidates);

      res.status(200).json({
        success: true,
        batchId,
        count: candidates.length,
        candidates: candidates.map((c, i) => ({
          row: i + 2,
          candidateName: c.candidateName,
          courseName: c.courseName,
          certificateNumber: c.certificateNumber ?? "(auto-generate)",
          certificateDate: c.certificateDate.toISOString().split("T")[0],
          qualification: c.qualification ?? null,
          email: c.email ?? null,
          phone: c.phone ?? null,
          organization: c.organization ?? null,
        })),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      res.status(400).json({ error: message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /generate/:batchId — Generate PDFs + save to DB + build ZIP
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/generate/:batchId",
  async (req: Request<{ batchId: string }>, res: Response): Promise<void> => {
    const { batchId } = req.params;

    try {
      // Mark batch as generating
      await prisma.batch.update({
        where: { id: batchId },
        data: { status: "generating" },
      }).catch(() => { /* batch may not exist if uploaded without DB tracking */ });

      const candidates = loadBatchData(batchId);
      const batchOutputDir = path.join(CERT_DIR, batchId);
      const pdfPaths: string[] = [];
      const generated: object[] = [];

      for (const candidate of candidates) {
        const certNumber = candidate.certificateNumber ?? genCertNumber();
        const candidateWithCertNum = { ...candidate, certificateNumber: certNumber };

        // Generate PDF
        const pdfPath = await generateCertificatePdf(
          candidateWithCertNum,
          batchOutputDir
        );
        pdfPaths.push(pdfPath);

        // Upsert to DB (skip duplicates via unique cert number)
        const record = await prisma.certificate.upsert({
          where: { certificateNumber: certNumber },
          create: {
            candidateName: candidate.candidateName,
            courseName: candidate.courseName,
            certificateNumber: certNumber,
            certificateDate: candidate.certificateDate,
            qualification: candidate.qualification ?? null,
            email: candidate.email ?? null,
            phone: candidate.phone ?? null,
            organization: candidate.organization ?? null,
            pdfPath,
            batchId,
          },
          update: {
            pdfPath,
          },
        });

        generated.push({
          id: record.id,
          certificateNumber: certNumber,
          candidateName: candidate.candidateName,
          courseName: candidate.courseName,
          pdfPath: path.relative(process.cwd(), pdfPath),
        });
      }

      // Build ZIP
      const zipPath = path.join(batchOutputDir, "all_certificates.zip");
      await buildZip(pdfPaths, zipPath);

      // Mark batch as done
      await prisma.batch.update({
        where: { id: batchId },
        data: { status: "done", count: generated.length },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        batchId,
        generated: generated.length,
        zipPath: path.relative(process.cwd(), zipPath),
        certificates: generated,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      console.error("[generate]", err);

      // Mark batch as error
      await prisma.batch.update({
        where: { id: batchId },
        data: { status: "error" },
      }).catch(() => {});

      res.status(500).json({ error: message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /batch/:batchId — Get all certificates in a batch
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/batch/:batchId",
  async (req: Request<{ batchId: string }>, res: Response): Promise<void> => {
    const { batchId } = req.params;

    try {
      const certificates = await prisma.certificate.findMany({
        where: { batchId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          candidateName: true,
          courseName: true,
          certificateNumber: true,
          certificateDate: true,
          qualification: true,
          email: true,
          phone: true,
          organization: true,
          pdfPath: true,
          batchId: true,
          createdAt: true,
        },
      });

      if (!certificates.length) {
        res.status(404).json({ error: `No certificates found for batch: ${batchId}` });
        return;
      }

      res.status(200).json({
        success: true,
        batchId,
        count: certificates.length,
        certificates,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Fetch failed.";
      res.status(500).json({ error: message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /batch/:batchId/download — Download all certificates as ZIP
// NOTE: Must be registered BEFORE /:id/download to avoid route collision
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/batch/:batchId/download",
  async (req: Request<{ batchId: string }>, res: Response): Promise<void> => {
    const { batchId } = req.params;

    try {
      const zipPath = path.join(CERT_DIR, batchId, "all_certificates.zip");

      // If ZIP doesn't exist, rebuild it from DB records
      if (!fs.existsSync(zipPath)) {
        const certs = await prisma.certificate.findMany({
          where: { batchId },
          select: { pdfPath: true },
        });

        if (!certs.length) {
          res.status(404).json({ error: `No certificates found for batch: ${batchId}` });
          return;
        }

        const pdfPaths = certs
          .map((c) => c.pdfPath)
          .filter((p): p is string => !!p && fs.existsSync(p));

        if (!pdfPaths.length) {
          res.status(404).json({ error: "No PDF files found on disk for this batch." });
          return;
        }

        await buildZip(pdfPaths, zipPath);
      }

      const safeBatch = batchId.replace(/[^a-zA-Z0-9_-]/g, "_");
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificates_${safeBatch}.zip"`
      );
      fs.createReadStream(zipPath).pipe(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed.";
      console.error("[batch-download]", err);
      res.status(500).json({ error: message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /:id/download — Download a single certificate PDF
// NOTE: Registered AFTER /batch/:batchId/download to avoid collisions
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:id/download",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const cert = await prisma.certificate.findUnique({
        where: { id },
      });

      if (!cert) {
        res.status(404).json({ error: `Certificate not found: ${id}` });
        return;
      }

      if (!cert.pdfPath || !fs.existsSync(cert.pdfPath)) {
        res.status(404).json({ error: "PDF file not found on disk." });
        return;
      }

      const safeName = `${cert.certificateNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      fs.createReadStream(cert.pdfPath).pipe(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed.";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
