import { PDFDocument, PDFFont, StandardFonts, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";
import type { CandidateRow } from "./excelParser.js";

export interface GeneratedCertificate {
  certificateNumber: string;
  pdfPath: string;
}

// rgb() only accepts 3 args in pdf-lib — no alpha channel
type RGB = ReturnType<typeof rgb>;

// ─── Template builder ──────────────────────────────────────────────────────────
export async function buildTemplate(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  // A4 landscape
  const page = doc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Fonts
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);

  // Helper: centered text
  function drawCenteredText(
    text: string,
    y: number,
    size: number,
    font: PDFFont,
    color: RGB
  ) {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  }

  // ── Background ──────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.05, 0.08, 0.18),
  });

  // Gold outer border (with fill, no transparency arg)
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: rgb(0.85, 0.7, 0.3),
    borderWidth: 3,
    color: rgb(0.07, 0.1, 0.22),
  });

  // Inner frame (border only — use opacity for the fill to appear invisible)
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.75, 0.6, 0.2),
    borderWidth: 1,
    color: rgb(0.07, 0.1, 0.22),
    opacity: 0.01, // near-invisible fill so border still shows
    borderOpacity: 1,
  });

  // ── Corner ornaments ─────────────────────────────────────────────────────────
  const corners = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 },
  ];
  for (const { x, y } of corners) {
    page.drawCircle({ x, y, size: 6, color: rgb(0.85, 0.7, 0.3) });
  }

  // ── Header bar ──────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 36,
    y: height - 100,
    width: width - 72,
    height: 56,
    color: rgb(0.12, 0.18, 0.38),
  });

  drawCenteredText("CERTIFICATE", height - 76, 38, timesBold, rgb(0.95, 0.82, 0.4));
  drawCenteredText("of Completion", height - 100, 16, timesItalic, rgb(0.75, 0.62, 0.28));

  // ── Top divider ──────────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: 80, y: height - 112 },
    end: { x: width - 80, y: height - 112 },
    thickness: 0.8,
    color: rgb(0.85, 0.7, 0.3),
  });

  // ── Body text ────────────────────────────────────────────────────────────────
  drawCenteredText("This is to certify that", height - 145, 13, timesItalic, rgb(0.75, 0.78, 0.85));

  // Name placeholder
  drawCenteredText("{{CANDIDATE_NAME}}", height - 188, 28, timesBold, rgb(0.95, 0.82, 0.4));

  // Name underline
  page.drawLine({
    start: { x: 120, y: height - 196 },
    end: { x: width - 120, y: height - 196 },
    thickness: 0.6,
    color: rgb(0.85, 0.7, 0.3),
  });

  drawCenteredText("has successfully completed the course", height - 225, 13, timesItalic, rgb(0.75, 0.78, 0.85));
  drawCenteredText("{{COURSE_NAME}}", height - 263, 22, timesBold, rgb(0.85, 0.92, 1.0));
  drawCenteredText("with qualification: {{QUALIFICATION}}", height - 293, 12, timesRoman, rgb(0.72, 0.75, 0.82));

  // ── Bottom divider ───────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: 80, y: height - 320 },
    end: { x: width - 80, y: height - 320 },
    thickness: 0.8,
    color: rgb(0.85, 0.7, 0.3),
  });

  // ── Footer row ───────────────────────────────────────────────────────────────
  const footerY = height - 350;

  // Date (left)
  page.drawText("Date of Issue", {
    x: 100, y: footerY + 18, size: 10,
    font: timesItalic, color: rgb(0.65, 0.68, 0.75),
  });
  page.drawText("{{DATE}}", {
    x: 100, y: footerY, size: 13,
    font: timesBold, color: rgb(0.95, 0.82, 0.4),
  });

  // Certificate No (center)
  const certLabel = "Certificate No.";
  const certLabelW = helvetica.widthOfTextAtSize(certLabel, 10);
  page.drawText(certLabel, {
    x: (width - certLabelW) / 2, y: footerY + 18, size: 10,
    font: timesItalic, color: rgb(0.65, 0.68, 0.75),
  });
  const certNumPlaceholder = "{{CERT_NUMBER}}";
  const certNumW = helvetica.widthOfTextAtSize(certNumPlaceholder, 13);
  page.drawText(certNumPlaceholder, {
    x: (width - certNumW) / 2, y: footerY, size: 13,
    font: timesBold, color: rgb(0.95, 0.82, 0.4),
  });

  // Organization (right)
  page.drawText("Issued by", {
    x: width - 210, y: footerY + 18, size: 10,
    font: timesItalic, color: rgb(0.65, 0.68, 0.75),
  });
  page.drawText("{{ORGANIZATION}}", {
    x: width - 210, y: footerY, size: 13,
    font: timesBold, color: rgb(0.95, 0.82, 0.4),
  });

  // ── Watermark ────────────────────────────────────────────────────────────────
  page.drawText("CERTIFIED", {
    x: 200, y: height / 2 - 60, size: 100,
    font: timesBold, color: rgb(1, 1, 1),
    opacity: 0.03, rotate: degrees(30),
  });

  return doc.save();
}

// ─── Certificate stamper ───────────────────────────────────────────────────────
export async function generateCertificatePdf(
  candidate: CandidateRow & { certificateNumber: string },
  outputDir: string
): Promise<string> {
  const templatePath = path.join(process.cwd(), "src", "template", "certificate.pdf");

  let templateBytes: Uint8Array;
  if (fs.existsSync(templatePath)) {
    templateBytes = new Uint8Array(fs.readFileSync(templatePath));
  } else {
    templateBytes = await buildTemplate();
    fs.mkdirSync(path.dirname(templatePath), { recursive: true });
    fs.writeFileSync(templatePath, templateBytes);
  }

  // Load fresh copy per certificate so placeholders are replaced cleanly
  const doc = await PDFDocument.load(templateBytes);
  const page = doc.getPages()[0];
  if (!page) throw new Error("Template PDF has no pages.");
  const { width, height } = page.getSize();

  const pg = page; // narrowed: PDFPage (not undefined) — safe to close over

  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);

  function drawCentered(text: string, y: number, size: number, font: PDFFont, color: RGB) {
    const tw = font.widthOfTextAtSize(text, size);
    pg.drawText(text, { x: (width - tw) / 2, y, size, font, color });
  }

  const dateStr = candidate.certificateDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const qualification = candidate.qualification?.trim() || "Pass";
  const organization = candidate.organization?.trim() || "Certifying Authority";

  // ── 1. Overpaint placeholder areas with the background colour ────────────────
  const bgColor = rgb(0.07, 0.1, 0.22);

  const coverAreas = [
    { y: height - 200, h: 32, xPad: 80 }, // name row
    { y: height - 276, h: 30, xPad: 50 }, // course row
    { y: height - 305, h: 20, xPad: 50 }, // qualification row
    { y: height - 365, h: 24, xPad: 50 }, // footer row (date/cert/org)
  ];

  for (const area of coverAreas) {
    page.drawRectangle({
      x: area.xPad,
      y: area.y,
      width: width - area.xPad * 2,
      height: area.h,
      color: bgColor,
    });
  }

  // ── 2. Draw real values ───────────────────────────────────────────────────────
  drawCentered(candidate.candidateName, height - 188, 28, timesBold, rgb(0.95, 0.82, 0.4));
  drawCentered(candidate.courseName, height - 263, 22, timesBold, rgb(0.85, 0.92, 1.0));
  drawCentered(`with qualification: ${qualification}`, height - 293, 12, timesRoman, rgb(0.72, 0.75, 0.82));

  // Date (left)
  page.drawText(dateStr, {
    x: 100, y: height - 350, size: 13,
    font: timesBold, color: rgb(0.95, 0.82, 0.4),
  });

  // Cert number (center)
  drawCentered(candidate.certificateNumber, height - 350, 13, timesBold, rgb(0.95, 0.82, 0.4));

  // Organization (right) — clamp long org names
  const orgText = organization.length > 20 ? organization.substring(0, 20) + "…" : organization;
  page.drawText(orgText, {
    x: width - 210, y: height - 350, size: 13,
    font: timesBold, color: rgb(0.95, 0.82, 0.4),
  });

  // ── 3. Save ──────────────────────────────────────────────────────────────────
  fs.mkdirSync(outputDir, { recursive: true });
  const safeNum = candidate.certificateNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  const outputPath = path.join(outputDir, `${safeNum}.pdf`);
  fs.writeFileSync(outputPath, await doc.save());

  return outputPath;
}
