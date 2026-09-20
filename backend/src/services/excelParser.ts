import * as XLSX from "xlsx";
import fs from "fs";

export interface CandidateRow {
  candidateName: string;
  courseName: string;
  certificateNumber?: string;
  certificateDate: Date;
  qualification?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

// Flexible column name aliases (all lowercase for comparison)
const COLUMN_MAP: Record<string, keyof CandidateRow> = {
  // Candidate name
  name: "candidateName",
  "candidate name": "candidateName",
  "full name": "candidateName",
  candidatename: "candidateName",

  // Course name
  course: "courseName",
  "course name": "courseName",
  coursename: "courseName",
  "program name": "courseName",
  program: "courseName",

  // Certificate number
  "certificate no": "certificateNumber",
  "certificate number": "certificateNumber",
  "cert no": "certificateNumber",
  "cert number": "certificateNumber",
  certificatenumber: "certificateNumber",
  certificateno: "certificateNumber",

  // Date
  date: "certificateDate",
  "certificate date": "certificateDate",
  "completion date": "certificateDate",
  certificatedate: "certificateDate",

  // Qualification
  qualification: "qualification",
  grade: "qualification",
  result: "qualification",

  // Email
  email: "email",
  "email address": "email",
  "e-mail": "email",

  // Phone
  phone: "phone",
  mobile: "phone",
  "phone number": "phone",
  contact: "phone",

  // Organization
  organization: "organization",
  organisation: "organization",
  company: "organization",
  institution: "organization",
  college: "organization",
  university: "organization",
};

/**
 * Robustly parse a date value from Excel.
 * Handles: JS Date objects, Excel serial numbers, ISO strings,
 * dd-mm-yyyy, dd/mm/yyyy, mm-dd-yyyy, mm/dd/yyyy, and more.
 */
function parseDate(raw: unknown): Date {
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? new Date() : raw;
  }

  if (typeof raw === "number") {
    // Excel serial date number → JS timestamp
    // Excel epoch: Jan 1 1900 = serial 1, but there's a leap-year bug (+1 day offset)
    const jsDate = new Date((raw - 25569) * 86400 * 1000);
    return isNaN(jsDate.getTime()) ? new Date() : jsDate;
  }

  if (typeof raw === "string" && raw.trim()) {
    const s = raw.trim();

    // Try dd-mm-yyyy or dd/mm/yyyy
    const dmyMatch = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1]!, 10);
      const m = parseInt(dmyMatch[2]!, 10);
      const y = parseInt(dmyMatch[3]!, 10);
      // Heuristic: if day > 12 it must be dd-mm-yyyy
      if (d > 12) {
        const date = new Date(y, m - 1, d);
        if (!isNaN(date.getTime())) return date;
      }
      // Otherwise try both interpretations, prefer dd-mm-yyyy for non-ambiguous
      const dateDMY = new Date(y, m - 1, d);
      if (!isNaN(dateDMY.getTime())) return dateDMY;
    }

    // Try yyyy-mm-dd
    const isoMatch = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (isoMatch) {
      const date = new Date(
        parseInt(isoMatch[1]!, 10),
        parseInt(isoMatch[2]!, 10) - 1,
        parseInt(isoMatch[3]!, 10)
      );
      if (!isNaN(date.getTime())) return date;
    }

    // Generic fallback
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return new Date(); // fallback to today
}

export function parseExcelFile(filePath: string): CandidateRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Read with cellDates:true so Excel dates come as JS Date objects
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel file has no sheets.");
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found in workbook.`);

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    raw: false, // coerce values to strings (except dates when cellDates is set)
    defval: "",
  });

  if (!rawRows.length) {
    throw new Error("Excel file is empty or has no data rows.");
  }

  const candidates: CandidateRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]!; // safe: i is always within bounds
    const mapped: Partial<CandidateRow> = {};

    for (const [col, value] of Object.entries(row)) {
      const key = COLUMN_MAP[col.toLowerCase().trim()];
      if (key && value !== "" && value !== null && value !== undefined) {
        if (key === "certificateDate") {
          (mapped as Record<string, unknown>)[key] = parseDate(value);
        } else {
          (mapped as Record<string, unknown>)[key] = String(value).trim();
        }
      }
    }

    if (!mapped.candidateName) {
      throw new Error(
        `Row ${i + 2}: Missing required field "Name" (candidate name). ` +
        `Available columns: ${Object.keys(row).join(", ")}`
      );
    }
    if (!mapped.courseName) {
      throw new Error(
        `Row ${i + 2}: Missing required field "Course" (course name). ` +
        `Available columns: ${Object.keys(row).join(", ")}`
      );
    }
    if (!mapped.certificateDate) {
      mapped.certificateDate = new Date();
    }

    candidates.push(mapped as CandidateRow);
  }

  return candidates;
}
