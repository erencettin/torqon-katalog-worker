import { renderToStream } from "@react-pdf/renderer";
import { getCoverAndIndexChunk, getProductChunk } from "./templates/ChunkTemplates";
import { groupProductsByBrand } from "@/lib/catalog-data";
import type { Product } from "@/lib/types";
import fs from "fs";
import path from "path";
import os from "os";
import { registerServerFonts } from "./FontService";
import { mergePdfChunks } from "./PDFMergeFallback";
import { generateQRMapForProducts } from "./QRService";
import { prefetchProductImages } from "./ImageService";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateJobStatus } from "./JobQueue";
import { execSync } from "child_process";

/**
 * Üretilen PDF'yi GitHub Releases'e yükler ve public URL döner.
 */
async function uploadToGitHubReleases(
  filePath: string,
  hash: string,
  isFiltered: boolean
): Promise<string | null> {
  try {
    const baseName = isFiltered ? "torqon_ozel_katalog" : "torqon_katalog";
    const fileName = `${baseName}_${hash}.pdf`;
    const finalPath = path.join(path.dirname(filePath), fileName);
    
    // Dosya adını hashli haliye değiştir
    fs.renameSync(filePath, finalPath);

    console.log("[PDF] GitHub Releases'e yükleniyor...");

    // 1. Önce 'catalogs' adında bir release var mı kontrol et, yoksa oluştur
    try {
      execSync(`gh release view catalogs`, { stdio: "ignore" });
    } catch {
      console.log("[PDF] Release bulunamadı, oluşturuluyor...");
      execSync(`gh release create catalogs --title "Kataloglar" --notes "Sistem tarafından otomatik üretilen kataloglar"`, { stdio: "inherit" });
    }

    // 2. Dosyayı bu release'e yükle (varsa üzerine yazar --clobber)
    execSync(`gh release upload catalogs "${finalPath}" --clobber`, { stdio: "inherit" });

    // 3. Eski PDF dosyalarını temizle (Sadece aynı kategorideki eski dosyaları sil)
    try {
      console.log(`[PDF] Eski ${baseName} dosyaları temizleniyor...`);
      const assetsJson = execSync(`gh release view catalogs --json assets`, { encoding: "utf-8" });
      const releaseData = JSON.parse(assetsJson);
      
      if (releaseData && Array.isArray(releaseData.assets)) {
        for (const asset of releaseData.assets) {
          const assetName = asset.name;
          // Eğer aynı baseName ile başlıyorsa ve yeni ürettiğimiz dosya değilse sil
          // (torqon_katalog_ vs torqon_ozel_katalog_)
          if (assetName.startsWith(baseName + "_") && assetName.endsWith(".pdf") && assetName !== fileName) {
            console.log(`[PDF] Eski asset siliniyor: ${assetName}`);
            execSync(`gh release delete-asset catalogs "${assetName}" -y`, { stdio: "ignore" });
          }
        }
      }
    } catch (cleanupErr: any) {
      console.error("[PDF] Eski PDF'leri temizlerken hata oluştu:", cleanupErr.message);
    }

    // 3. GitHub public download URL'ini dön
    // Format: https://github.com/OWNER/REPO/releases/download/TAG/FILE_NAME
    const repo = process.env.GITHUB_REPO; // örn: erencettin/mepak-katalog
    if (!repo) throw new Error("GITHUB_REPO env bulunamadı");

    return `https://github.com/${repo}/releases/download/catalogs/${fileName}`;
  } catch (err: any) {
    console.error("[PDF] GitHub Releases upload hatası:", err.message);
    return null;
  }
}

async function fetchAllProducts(brands?: string[]): Promise<Product[]> {
  const ranges: [number, number][] = [
    [0, 999], [1000, 1999], [2000, 2999], [3000, 3999], [4000, 4999],
  ];
  const results = await Promise.all(
    ranges.map(([from, to]) => {
      let q = supabaseAdmin
        .from("products")
        .select("id, mepak_kodu, tanim_tr, tanim_en, marka_adi, oem_no, model, model_yil, resim_kodlari")
        .range(from, to)
        .order("marka_adi", { ascending: true })
        .order("mepak_kodu", { ascending: true });
      if (brands && brands.length > 0) q = q.in("marka_adi", brands);
      return q;
    })
  );
  return results.flatMap((r) => (r.data || []) as Product[]);
}

const KATALOG_DIR = path.join(process.cwd(), "public", "katalog");
const INTRO_COUNT = 5;

function getTempFilePath(hash: string): string {
  return path.join(os.tmpdir(), `catalog_${hash}.pdf`);
}

function streamToFile(stream: NodeJS.ReadableStream, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    stream.pipe(fileStream);
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });
}

export async function generateCatalogPDF(
  jobId: string,
  hash: string,
  filters?: { brands?: string[] }
): Promise<string> {
  const finalFilePath = getTempFilePath(hash);

  registerServerFonts();

  // ─── 1. Ürünleri çek ─────────────────────────────────────────────────────
  await updateJobStatus(jobId, { progress: 5 });
  const products = await fetchAllProducts(filters?.brands);
  const groupedBrands = groupProductsByBrand(products);

  // ─── 2+3. QR kodları + görsel indirme — paralel başlat ─────────────────────
  // İkisi birbirinden tamamen bağımsız Map üretiyor; birinin sonucu diğerini
  // hiçbir şekilde etkilemez. PDF'e ulaştığında her ikisi hazır halde gelir.
  await updateJobStatus(jobId, { progress: 8 });
  const [qrMap, imgMap] = await Promise.all([
    generateQRMapForProducts(products.map((p) => p.id)),
    prefetchProductImages(products),
  ]);

  // mergeFiles: birleştirilecek tüm PDF yolları (sırayla)
  // tempFiles:  işlem sonrası silinecek geçici dosyalar
  const mergeFiles: string[] = [];
  const tempFiles: string[] = [];

  // ─── 4. Intro PDF'leri (1.pdf → 5.pdf) ──────────────────────────────────
  await updateJobStatus(jobId, { progress: 12 });
  for (let i = 1; i <= INTRO_COUNT; i++) {
    const introPath = path.join(KATALOG_DIR, `${i}.pdf`);
    if (fs.existsSync(introPath)) {
      mergeFiles.push(introPath); // kaynak dosya — silinmez
    } else {
      console.warn(`[PDF] Intro PDF bulunamadı: ${i}.pdf`);
    }
  }

  // ─── 5. Marka listesi (brand index) chunk ────────────────────────────────
  await updateJobStatus(jobId, { progress: 15 });
  const indexStream = await renderToStream(
    getCoverAndIndexChunk(products, groupedBrands) as any
  );
  const indexPath = getTempFilePath(`${hash}_chunk_index`);
  await streamToFile(indexStream as unknown as NodeJS.ReadableStream, indexPath);
  mergeFiles.push(indexPath);
  tempFiles.push(indexPath);

  // ─── 6. Marka ürün sayfaları — paralel render, sıra korumalı ──────────────
  //
  // • RENDER_CONCURRENCY marka aynı anda render edilir → toplam süre ~4x kısalır.
  // • chunkPaths[globalIdx] ile dosya yolu index'e bağlanarak yazılır,
  //   böylece paralel tamamlansa da mergeFiles sırası (marka sırası) kesinlikle
  //   korunur — PDF sayfa düzeni bozulmaz.
  const RENDER_CONCURRENCY = 4;
  // Önceden boyutlandırılmış dizi: her index keşinlikle tek bir üretici tarafından yazılır.
  const chunkPaths: string[] = new Array(groupedBrands.length).fill("");

  for (let batchStart = 0; batchStart < groupedBrands.length; batchStart += RENDER_CONCURRENCY) {
    const batchEnd = Math.min(batchStart + RENDER_CONCURRENCY, groupedBrands.length);
    const batchSlice = groupedBrands.slice(batchStart, batchEnd);

    await Promise.all(
      batchSlice.map(async (brand, offsetInBatch) => {
        const globalIdx = batchStart + offsetInBatch;
        const cPath = getTempFilePath(`${hash}_chunk_prod_${globalIdx}`);
        const chunkStream = await renderToStream(
          getProductChunk([brand], qrMap, imgMap) as any
        );
        await streamToFile(chunkStream as unknown as NodeJS.ReadableStream, cPath);
        // Index sabitleme: paralel yazılsa da sıra garanti.
        chunkPaths[globalIdx] = cPath;
      })
    );

    // Batch tamamlandıktan sonra ilerleme güncelle (DB çağrı sayısını azaltır).
    const progressVal = Math.floor(15 + (batchEnd / groupedBrands.length) * 78);
    await updateJobStatus(jobId, { progress: Math.min(progressVal, 93) });
  }

  // Sıralı diziden mergeFiles + tempFiles'a aktar (marka sırası korunur).
  for (const cPath of chunkPaths) {
    if (cPath) {
      mergeFiles.push(cPath);
      tempFiles.push(cPath);
    }
  }

  // ─── 7. Hepsini birleştir ─────────────────────────────────────────────────
  await updateJobStatus(jobId, { progress: 95 });
  await mergePdfChunks(mergeFiles, finalFilePath);

  // ─── 8. Ara geçici dosyaları temizle ─────────────────────────────────────
  tempFiles.forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });

  // ─── 9. GitHub Releases'e yükle ──────────────────────────────────────────
  const isFiltered = filters && Object.keys(filters).length > 0;
  const downloadUrl = await uploadToGitHubReleases(finalFilePath, hash, !!isFiltered);

  if (!downloadUrl) {
    throw new Error("GitHub Releases'e yükleme başarısız oldu.");
  }

  await updateJobStatus(jobId, { status: "done", progress: 100, file_url: downloadUrl });

  return downloadUrl;
}
