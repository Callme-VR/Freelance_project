import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function buildZip(
  pdfPaths: string[],
  outputPath: string
): Promise<string> {
  const zip = new JSZip();

  for (const pdfPath of pdfPaths) {
    if (fs.existsSync(pdfPath)) {
      zip.file(path.basename(pdfPath), fs.readFileSync(pdfPath));
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(outputPath, content);
  return outputPath;
}
