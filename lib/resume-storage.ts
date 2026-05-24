import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "resumes");

export type ResumeValidationResult =
  | { ok: true; extension: string; mimeType: string }
  | { ok: false; error: string };

export function validateResumeFile(file: File): ResumeValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, error: "No file selected" };
  }

  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: "File must be 5 MB or smaller" };
  }

  const originalName = file.name.toLowerCase();
  const extension = ALLOWED_RESUME_EXTENSIONS.find((ext) =>
    originalName.endsWith(ext)
  );

  if (!extension) {
    return {
      ok: false,
      error: "Only PDF, DOC, and DOCX files are allowed",
    };
  }

  const mimeType = file.type || guessMimeFromExtension(extension);

  if (
    mimeType &&
    !ALLOWED_RESUME_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_RESUME_MIME_TYPES)[number]
    )
  ) {
    return { ok: false, error: "Invalid file type" };
  }

  return {
    ok: true,
    extension,
    mimeType: mimeType || guessMimeFromExtension(extension),
  };
}

function guessMimeFromExtension(ext: string): string {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export function getResumeDiskPath(userId: string, extension: string): string {
  return path.join(UPLOAD_ROOT, `${userId}${extension}`);
}

export async function ensureResumeDir(): Promise<void> {
  await mkdir(UPLOAD_ROOT, { recursive: true });
}

export async function removeResumeFilesForUser(userId: string): Promise<void> {
  try {
    const files = await readdir(UPLOAD_ROOT);
    await Promise.all(
      files
        .filter((f) => f.startsWith(userId))
        .map((f) => unlink(path.join(UPLOAD_ROOT, f)))
    );
  } catch {
    // directory may not exist
  }
}

export async function saveResumeFile(
  userId: string,
  file: File,
  extension: string
): Promise<{ storagePath: string; absolutePath: string }> {
  await ensureResumeDir();
  await removeResumeFilesForUser(userId);

  const absolutePath = getResumeDiskPath(userId, extension);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const storagePath = `resumes/${userId}${extension}`;
  return { storagePath, absolutePath };
}

export function resolveResumeAbsolutePath(storagePath: string): string {
  return path.join(process.cwd(), "uploads", storagePath);
}

// export async function extractTextFromResume(
//   absolutePath: string,
//   mimeType: string | null
// ): Promise<{ text: string; warning?: string }> {
//   if (mimeType === "application/pdf" || absolutePath.endsWith(".pdf")) {
//     const { readFile: readFileFs } = await import("fs/promises");
//     const buffer = await readFileFs(absolutePath);
//     const pdfModule = await import("pdf-parse");
//     const pdfParse =
//       typeof pdfModule === "function"
//         ? pdfModule
//         : (pdfModule as { default?: (buf: Buffer) => Promise<{ text: string }> })
//             .default;
//     if (!pdfParse) {
//       return { text: "", warning: "PDF parser unavailable" };
//     }
//     const parsed = await pdfParse(buffer);
//     return { text: (parsed.text || "").trim() };
//   }

//   return {
//     text: "",
//     warning:
//       "Automatic text extraction works for PDF only. Paste resume text in the analyzer for DOC/DOCX files.",
//   };
// }
export async function extractTextFromResume(
  resumePath: string,
  mimeType: string | null
): Promise<{ text: string; warning?: string }> {

  // PDF extraction
  if (
    mimeType === "application/pdf" ||
    resumePath.endsWith(".pdf")
  ) {
    try {

      const pdf = require("pdf-parse-fixed");

      let dataBuffer: Buffer;

      // UploadThing URL
      if (
        resumePath.startsWith("http://") ||
        resumePath.startsWith("https://")
      ) {

        const response = await fetch(resumePath);

        if (!response.ok) {
          throw new Error("Failed to fetch resume");
        }

        const arrayBuffer =
          await response.arrayBuffer();

        dataBuffer = Buffer.from(arrayBuffer);

      } else {

        // Local file support
        const fs = require("fs");

        dataBuffer = fs.readFileSync(resumePath);
      }

      const data = await pdf(dataBuffer);

      return {
        text: (data.text || "").trim(),
      };

    } catch (error) {

      console.error(
        "PDF extraction error:",
        error
      );

      return {
        text: "",
        warning:
          "Failed to extract text from PDF",
      };
    }
  }

  // DOC / DOCX unsupported
  return {
    text: "",
    warning:
      "Automatic extraction currently supports PDF only.",
  };
}