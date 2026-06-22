import { PDFDocument } from "pdf-lib";
import fs from "fs";

/**
 * [FALLBACK STRATEGY]
 * Eğer 1000+ sayfalık yapı Node.js bellek limitini zorlar veya Vercel platformunda
 * Timeout sınırlarına (örn: 10s) çarparsa (Chunk timeout durumları),
 * PDF'ler örneğin 50'şer sayfalık parçalar halinde (Chunk) üretilip temp dizinine kaydedilir.
 * Bu servis, belirlenen bu küçük chunk'ları birleştirerek tek bir master PDF döner.
 */
export async function mergePdfChunks(chunkFilePaths: string[], outputPath: string): Promise<string> {
  const mergedPdf = await PDFDocument.create();

  for (const chunkPath of chunkFilePaths) {
    if (!fs.existsSync(chunkPath)) {
      console.warn(`Chunk file not found, skipping: ${chunkPath}`);
      continue;
    }

    const chunkBytes = fs.readFileSync(chunkPath);
    const chunkDoc = await PDFDocument.load(chunkBytes);
    
    // Copy all pages from chunk into master
    const copiedPages = await mergedPdf.copyPages(chunkDoc, chunkDoc.getPageIndices());
    
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  const mergedPdfFile = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedPdfFile);

  return outputPath;
}
