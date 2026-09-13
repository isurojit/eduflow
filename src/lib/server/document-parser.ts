import type { DocumentAnalysis, DocumentKind } from "@/types/cloud";
import { geminiAnalyzeDocument, geminiConfigured } from "@/lib/server/gemini";

const MAX_TEXT = 160_000;

function clean(text: string) { return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim().slice(0, MAX_TEXT); }

async function extractText(buffer: Buffer, mimeType: string, name: string) {
  const lower = name.toLowerCase();
  if (mimeType === "text/plain" || mimeType === "text/csv" || lower.endsWith(".txt") || lower.endsWith(".csv")) return clean(buffer.toString("utf8"));
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    return clean((await pdfParse(buffer)).text || "");
  }
  if (mimeType.includes("wordprocessingml") || lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    return clean((await mammoth.extractRawText({ buffer })).value || "");
  }
  if (mimeType.includes("spreadsheet") || lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const book = XLSX.read(buffer, { type: "buffer" });
    return clean(book.SheetNames.map((sheet) => `# ${sheet}\n${XLSX.utils.sheet_to_csv(book.Sheets[sheet])}`).join("\n\n"));
  }
  return "";
}

function heuristicAnalysis(name: string, text: string, requested?: DocumentKind): DocumentAnalysis {
  const lower = `${name} ${text.slice(0, 5000)}`.toLowerCase();
  const suggestedKind: DocumentKind = requested && requested !== "other" ? requested : /mark|score|grade|result/.test(lower) ? "marksheet" : /syllabus|curriculum|unit|semester/.test(lower) ? "syllabus" : /question|marks?\)|answer any/.test(lower) ? "question-paper" : text ? "notes" : "other";
  const lines = text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const keyPoints = lines.filter((line) => line.length > 20 && line.length < 180).slice(0, 8);
  return { summary: text ? (lines.slice(0, 5).join(" ").slice(0, 700) || "Document imported.") : "File uploaded. Add Gemini configuration for image/PDF visual understanding.", keyPoints, suggestedKind, noteTitle: suggestedKind === "notes" ? name.replace(/\.[^.]+$/, "") : undefined, noteBody: suggestedKind === "notes" ? text.slice(0, 12_000) : undefined };
}

export async function parseStudentDocument(input: { buffer: Buffer; mimeType: string; name: string; requestedKind?: DocumentKind }) {
  const text = await extractText(input.buffer, input.mimeType, input.name);
  let analysis = heuristicAnalysis(input.name, text, input.requestedKind);
  if (geminiConfigured()) {
    try { analysis = await geminiAnalyzeDocument({ name: input.name, mimeType: input.mimeType, text: text || undefined, buffer: text ? undefined : input.buffer }); }
    catch { /* safe heuristic fallback */ }
  }
  return { text, analysis };
}
