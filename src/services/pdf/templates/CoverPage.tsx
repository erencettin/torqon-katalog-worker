import React from "react";
import { Page, Text, View, StyleSheet, Svg, Line, Circle, Image } from "@react-pdf/renderer";
import { BrandGroup, Product } from "@/lib/catalog-data";
import path from "path";
import { SAYFA_DUZENI, PAGE_BG_STYLE } from "./PageTemplate";

const LOGO_PATH = path.join(process.cwd(), "public", "images", "logo_mepak.png");

// ─── Mepak Brand Colors (Bagen-style palette) ───────────────────────────────
const C = {
  navy:      "#4E94BF",   // primary dark navy (Bagen'in laciverdi)
  navyMid:   "#1a3a6b",   // secondary navy
  navyLight: "#1e4d8c",   // lighter navy accent
  orange:    "#eb7b2d",   // accent orange
  orangeLight:"#f59c5a",  // light orange
  white:     "#ffffff",
  offWhite:  "#f0f4fa",
  grey:      "#94a3b8",
  greyDark:  "#64748b",
  textDark:  "#1e293b",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.navy,
    padding: 0,
    fontFamily: "Roboto",
    color: C.white,
    position: "relative",
  },
  // ─── Orange L-Frame ─────────────────────────────────────────────────────
  lFrameTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: C.orange,
  },
  lFrameLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 8,
    bottom: 0,
    backgroundColor: C.orange,
  },
  // ─── Inner Layout ────────────────────────────────────────────────────────
  inner: {
    flex: 1,
    padding: 45,
    paddingLeft: 53, // account for left orange bar
    paddingTop: 28,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  // ─── Top Bar ─────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMark: {
    width: 36,
    height: 36,
    backgroundColor: C.orange,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoMarkText: {
    fontSize: 20,
    fontWeight: 900,
    color: C.white,
    textAlign: "center",
  },
  logoTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: C.white,
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    fontSize: 8,
    fontWeight: 400,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  yearBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  yearNum: {
    fontSize: 18,
    fontWeight: 900,
    color: C.orange,
  },
  yearLbl: {
    fontSize: 7,
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
    marginTop: 1,
  },
  // ─── Hero Section ─────────────────────────────────────────────────────────
  heroSection: {
    marginTop: 30,
    flex: 1,
    justifyContent: "center",
  },
  tagline: {
    fontSize: 9,
    fontWeight: 900,
    color: C.orange,
    letterSpacing: 3,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 58,
    fontWeight: 900,
    color: C.white,
    lineHeight: 1.05,
    letterSpacing: -1,
  },
  heroTitle2: {
    fontSize: 58,
    fontWeight: 900,
    color: C.white,
    lineHeight: 1.05,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    marginTop: 16,
    letterSpacing: 2.5,
  },
  // ─── Divider Line ─────────────────────────────────────────────────────────
  dividerLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 20,
  },
  // ─── Stats Row ────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 20,
  },
  statItem: {
    marginRight: 36,
  },
  statNum: {
    fontSize: 34,
    fontWeight: 900,
    color: C.white,
  },
  statLbl: {
    fontSize: 8,
    fontWeight: 900,
    color: C.orange,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  footerLeft: {
    flexDirection: "column",
  },
  footerLbl: {
    fontSize: 7,
    fontWeight: 900,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 2,
    marginBottom: 2,
  },
  footerVal: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(255,255,255,0.75)",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  // ─── Decorative Tech Drawing (bottom-left) ───────────────────────────────
  techDrawingArea: {
    position: "absolute",
    bottom: 80,
    left: 55,
    opacity: 0.06,
  },
});

/** Tiny technical drawing motif — subtle circle/line parts SVG */
const TechDrawingMotif = () => (
  <View style={styles.techDrawingArea}>
    <Svg width="180" height="140" viewBox="0 0 180 140">
      {/* Abstract steering/suspension part lines */}
      <Circle cx="90" cy="70" r="55" stroke="white" strokeWidth="1" fill="none" />
      <Circle cx="90" cy="70" r="35" stroke="white" strokeWidth="0.8" fill="none" />
      <Circle cx="90" cy="70" r="15" stroke="white" strokeWidth="0.6" fill="none" />
      <Line x1="35" y1="70" x2="145" y2="70" stroke="white" strokeWidth="0.7" />
      <Line x1="90" y1="15" x2="90" y2="125" stroke="white" strokeWidth="0.7" />
      <Line x1="51" y1="31" x2="129" y2="109" stroke="white" strokeWidth="0.5" />
      <Line x1="129" y1="31" x2="51" y2="109" stroke="white" strokeWidth="0.5" />
      {/* Dimension lines */}
      <Line x1="10" y1="60" x2="10" y2="80" stroke="white" strokeWidth="0.5" />
      <Line x1="7" y1="70" x2="35" y2="70" stroke="white" strokeWidth="0.5" />
      <Line x1="160" y1="60" x2="160" y2="80" stroke="white" strokeWidth="0.5" />
      <Line x1="145" y1="70" x2="163" y2="70" stroke="white" strokeWidth="0.5" />
      {/* Small bolt holes */}
      <Circle cx="90" cy="25" r="4" stroke="white" strokeWidth="0.6" fill="none" />
      <Circle cx="90" cy="115" r="4" stroke="white" strokeWidth="0.6" fill="none" />
      <Circle cx="38" cy="70" r="4" stroke="white" strokeWidth="0.6" fill="none" />
      <Circle cx="142" cy="70" r="4" stroke="white" strokeWidth="0.6" fill="none" />
    </Svg>
  </View>
);

export const CoverPage = ({
  products,
  groupedBrands,
}: {
  products: Product[];
  groupedBrands: BrandGroup[];
}) => (
  <Page size="A4" style={styles.page}>
    {/* Orange L-Frame Borders */}
    <View style={styles.lFrameTop} />
    <View style={styles.lFrameLeft} />

    {/* Subtle decorative tech drawing */}
    <TechDrawingMotif />

    <View style={styles.inner}>
      {/* Top bar: Logo + Year Badge */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Image src={LOGO_PATH} style={{ width: 140, height: 50, objectFit: "contain" }} />
        </View>
        <View style={styles.yearBadge}>
          <Text style={styles.yearNum}>2026</Text>
          <Text style={styles.yearLbl}>EDITION</Text>
        </View>
      </View>

      {/* Hero Title Area */}
      <View style={styles.heroSection}>
        <Text style={styles.tagline}>TORQON PRODUCT CATALOG · ÜRÜN KATALOĞU</Text>
        <Text style={styles.heroTitle}>DİREKSİYON</Text>
        <Text style={styles.heroTitle2}>PARÇALARI</Text>
        <Text style={styles.heroSub}>TORQON STEERING & SUSPENSION PARTS — BY MEPAK</Text>
      </View>

      {/* Bottom Section */}
      <View>
        <View style={styles.dividerLine} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{products.length.toString()}</Text>
            <Text style={styles.statLbl}>ÜRÜN · PRODUCTS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{groupedBrands.length.toString()}</Text>
            <Text style={styles.statLbl}>MARKA · BRANDS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>20+</Text>
            <Text style={styles.statLbl}>YIL · YEARS</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLbl}>WEB</Text>
            <Text style={styles.footerVal}>www.torqon.com.tr</Text>
          </View>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLbl}>TORQON TECHNICAL CATALOG</Text>
            <Text style={styles.footerVal}>Yedek Parça Ürün Kataloğu</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerLbl}>MERKEZ</Text>
            <Text style={styles.footerVal}>BOLU · TÜRKİYE</Text>
          </View>
        </View>
      </View>
    </View>
  </Page>
);
