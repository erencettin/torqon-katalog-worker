import path from "path";
import fs from "fs";

function toDataUrl(filePath: string, mime: string): string {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export const SAYFA_DUZENI = toDataUrl(
  path.join(process.cwd(), "public", "katalog", "sayfa_düzeni.jpg"),
  "image/jpeg"
);

export const LOGO_DATA = (() => {
  const p = path.join(process.cwd(), "public", "images", "logo_mepak.png");
  return fs.existsSync(p) ? toDataUrl(p, "image/png") : null;
})();

// A4 = 595 × 842 pt — yüzde değeri react-pdf'de "can't wrap" hatasına yol açar
export const PAGE_BG_STYLE = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  width: 595,
  height: 842,
};
