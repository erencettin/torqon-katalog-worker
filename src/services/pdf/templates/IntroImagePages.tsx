import React from "react";
import { Page, Image, StyleSheet } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

function toDataUrl(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// 595 × 842 pt = A4 = 21cm × 29.7cm
const INTRO_IMAGES = [1, 2, 3, 4, 5].map((n) =>
  toDataUrl(path.join(process.cwd(), "public", "katalog", `${n}.jpg`))
);

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "white",
  },
  img: {
    width: 595,
    height: 842,
    objectFit: "fill",
  },
});

export function IntroImagePages() {
  return (
    <>
      {INTRO_IMAGES.map((imgData, i) => (
        <Page key={`intro-${i + 1}`} size="A4" style={styles.page} wrap={false}>
          <Image src={imgData} style={styles.img} />
        </Page>
      ))}
    </>
  );
}
