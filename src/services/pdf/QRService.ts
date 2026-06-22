import QRCode from "qrcode";

const SITE_URL = process.env.SITE_URL || "https://torqon.com.tr";

/**
 * Verilen ürün UUID'si için ürün sayfası URL'si oluşturur.
 * Dev: http://localhost:3000/tr/urun/{id}
 * Prod: https://www.mepak.com.tr/tr/urun/{id}
 */
export function getProductUrl(productId: string): string {
  return `${SITE_URL}/tr/urun/${productId}`;
}

/**
 * Verilen URL için QR kodu PNG base64 data URL'si üretir.
 * React-PDF'in <Image src="data:image/png;base64,..."> ile kullanılabilir.
 */
export async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    type: "image/png",
    width: 120,
    margin: 1,
    color: {
      dark: "#0d2d5e",  // Navy mavi QR noktaları
      light: "#ffffff", // Beyaz arka plan
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Ürün listesi için QR data URL map'i toplu olarak üretir.
 * key = product.id, value = data URL string
 */
export async function generateQRMapForProducts(
  productIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  // Paralel üretim (100'lük batch) — tamamen CPU-bound iş, ağ yok.
  // OOM riski ihmal edilebilir; 50→100 ile tur sayısı yarıya iner.
  const BATCH = 100;
  for (let i = 0; i < productIds.length; i += BATCH) {
    const batch = productIds.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (id) => {
        const url = getProductUrl(id);
        const dataUrl = await generateQRDataUrl(url);
        return [id, dataUrl] as [string, string];
      })
    );
    for (const [id, dataUrl] of results) {
      map.set(id, dataUrl);
    }
  }

  return map;
}
