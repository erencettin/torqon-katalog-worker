import { generateCatalogPDF } from "./PDFGeneratorService";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { supabaseAdmin } from "@/lib/supabase-admin";

type JobState = {
  status: "pending" | "processing" | "done" | "error";
  progress: number;
  file_url?: string;
  error?: string;
};

/**
 * Gets the status of a PDF generation job from Supabase.
 */
export async function getJobStatus(jobId: string): Promise<JobState | null> {
  const { data, error } = await supabaseAdmin
    .from("pdf_jobs")
    .select("status, progress, file_url, error")
    .eq("id", jobId)
    .single();

  if (error || !data) return null;
  return data as JobState;
}

/**
 * Updates the status of a PDF generation job in Supabase.
 */
export async function updateJobStatus(jobId: string, updates: Partial<JobState>) {
  await supabaseAdmin
    .from("pdf_jobs")
    .update(updates)
    .eq("id", jobId);
}

/**
 * Hash, Content (katalog verileri) + Filters bazlı oluşturulmaktadır.
 */
export async function generateContentHash(filters: any): Promise<string> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const lastUpdate = data?.updated_at || "no-data";
  const payload = JSON.stringify(filters) + "-catalog-production-" + lastUpdate;
  return crypto.createHash("md5").update(payload).digest("hex");
}

/** Delete catalog PDFs older than 24 hours from the system temp directory. */
function cleanOldPdfFiles() {
  const tmpDir = os.tmpdir();
  const maxAgeMs = 24 * 60 * 60 * 1000;
  try {
    fs.readdirSync(tmpDir)
      .filter((f) => f.startsWith("catalog_") && f.endsWith(".pdf"))
      .forEach((f) => {
        const filePath = path.join(tmpDir, f);
        const stat = fs.statSync(filePath);
        if (Date.now() - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      });
  } catch {
    // Non-fatal — cleanup best-effort
  }
}

export async function startPdfJob(filters: any): Promise<string> {
  cleanOldPdfFiles();

  const contentHash = await generateContentHash(filters);
  
  // 1. Create job in Supabase
  const { data: job, error } = await supabaseAdmin
    .from("pdf_jobs")
    .insert([{ status: "pending", progress: 0 }])
    .select()
    .single();

  if (error || !job) {
    throw new Error("Failed to create PDF job in database");
  }

  const jobId = job.id;

  // 2. Start generation in background
  // Note: On Vercel, this might still time out if it takes too long.
  // We trigger it without awaiting.
  (async () => {
    try {
      await updateJobStatus(jobId, { status: "processing", progress: 5 });
      
      // generation begins
      await generateCatalogPDF(jobId, contentHash, filters);
      
      // Status is updated inside generateCatalogPDF to mark as 'done' with the URL
    } catch (error: any) {
      console.error("PDF Job Failed:", error);
      await updateJobStatus(jobId, { status: "error", progress: 0, error: error.message });
    }
  })();

  return jobId;
}
