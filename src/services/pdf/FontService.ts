import { Font } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

/**
 * Node.js (Sunucu) tarafında çalışırken fontları tescil eder.
 * Local filesystem (public klasörü) kullanılarak ağ sorunları ve timeout'lar önlenir.
 */
export function registerServerFonts() {
  // Production vs Dev path çözümlemesi
  const fontDir = path.join(process.cwd(), "public", "fonts");

  // Eğer lokal font klasörü henüz yoksa geçici olarak CDN tescili (Fallback) yapılır
  if (!fs.existsSync(fontDir)) {
    console.warn("Local font klasörü bulunamadı. CDN fallback kullanılıyor.");
    Font.register({
      family: "Roboto",
      fonts: [
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf", fontWeight: 900 },
      ],
    });
    return;
  }

  // Lokal Dosya bazlı Tescil Modeli
  Font.register({
    family: "Roboto",
    fonts: [
      { src: path.join(fontDir, "Roboto-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontDir, "Roboto-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontDir, "Roboto-Bold.ttf"), fontWeight: 700 },
      { src: path.join(fontDir, "Roboto-Black.ttf"), fontWeight: 900 },
    ],
  });
}
