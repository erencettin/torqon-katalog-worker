/**
 * GitHub Actions PDF Generator Script
 *
 * Ortam değişkenleri GitHub Actions'dan gelir:
 *   JOB_ID              → Supabase job ID
 *   CONTENT_HASH        → PDF içerik hash'i
 *   FILTERS             → JSON string (örn: {"brands":["FORD"]})
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SITE_URL
 */

import { generateCatalogPDF } from "../src/services/pdf/PDFGeneratorService";
import { registerServerFonts } from "../src/services/pdf/FontService";

const jobId = process.env.JOB_ID;
const hash = process.env.CONTENT_HASH;
const filtersRaw = process.env.FILTERS || "{}";

if (!jobId || !hash) {
  console.error("❌ Eksik env: JOB_ID ve CONTENT_HASH zorunlu.");
  process.exit(1);
}

let filters: { brands?: string[] } = {};
try {
  filters = JSON.parse(filtersRaw);
} catch {
  console.warn("FILTERS JSON parse hatası, boş filtre kullanılıyor.");
}

async function main() {
  console.log(`🚀 PDF üretimi başlıyor — Job: ${jobId}`);
  console.log(`   Hash: ${hash}`);
  console.log(`   Filters: ${JSON.stringify(filters)}`);

  registerServerFonts();

  const url = await generateCatalogPDF(jobId!, hash!, filters);
  console.log(`✅ Tamamlandı. İndirme URL: ${url}`);
}

main().catch((err) => {
  console.error("❌ PDF üretimi başarısız:", err);
  process.exit(1);
});
