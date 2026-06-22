import React from "react";
import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { BrandGroup, Product } from "@/lib/catalog-data";
import { SAYFA_DUZENI, PAGE_BG_STYLE, LOGO_DATA } from "./PageTemplate";

// ─── Mepak Brand Colors ──────────────────────────────────────────────────────
const C = {
  navy:      "#031a3c",  // açık mavi → koyu lacivert
  navyMid:   "#ffffff",  // lacivert → beyaz
  navyLight: "#031a3c",  // lacivert açık → koyu lacivert
  orange:    "#545454",  // turuncu → koyu gri
  white:     "#ffffff",
  offWhite:  "#f0f4fa",
  lightBg:   "#f4f6fb",
  border:    "#e2e8f0",
  textDark:  "#1e293b",
  textMid:   "#64748b",
  textLight: "#94a3b8",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    padding: 0,
    fontFamily: "Roboto",
    color: C.textDark,
  },
  pageInner: {
    flex: 1,
    padding: 30,
    flexDirection: "column",
  },
  // ─── Outer shell with light bg ──────────────────────────────────────────
  shell: {
    flex: 1,
    backgroundColor: C.lightBg,
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  // ─── Header (first page only) ────────────────────────────────────────────
  header: {
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eyebrow: {
    fontSize: 8,
    fontWeight: 900,
    color: C.orange,
    letterSpacing: 3,
    marginBottom: 6,
  },
  titleBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  titleMain: {
    fontSize: 28,
    fontWeight: 900,
    color: C.navy,
    letterSpacing: -0.5,
  },
  titleSub: {
    fontSize: 14,
    fontWeight: 700,
    color: C.textMid,
    marginLeft: 8,
    marginBottom: 3,
  },
  desc: {
    fontSize: 9,
    color: C.textMid,
    marginTop: 8,
    lineHeight: 1.6,
    maxWidth: "75%",
  },
  // ─── Summary Stats Strip ─────────────────────────────────────────────────
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: "dashed",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 20,
  },
  summaryNum: { fontSize: 15, fontWeight: 900, color: C.navy, marginRight: 4 },
  summaryLbl: { fontSize: 8, fontWeight: 900, color: C.textMid, letterSpacing: 1 },
  summaryDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.textLight,
    marginRight: 20,
    alignSelf: "center",
  },
  // ─── 3-Column Grid ───────────────────────────────────────────────────────
  gridRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  // ─── Brand Card ──────────────────────────────────────────────────────────
  card: {
    width: "31.5%",
    backgroundColor: C.navy,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
  },
  // Left accent bar (koyu bg üstünde görünür ton)
  cardOrangeBar: {
    width: 5,
    backgroundColor: "#9ca3af",
  },
  cardBody: {
    flex: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
  },
  cardNo: {
    fontSize: 7,
    fontWeight: 900,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardName: {
    fontSize: 11,
    fontWeight: 900,
    color: C.white,
    lineHeight: 1.2,
  },
  cardMeta: {
    fontSize: 7,
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  // Right: product count badge
  cardBadge: {
    backgroundColor: C.orange,
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 7,
    alignItems: "center",
    minWidth: 30,
  },
  cardBadgeNum: {
    fontSize: 13,
    fontWeight: 900,
    color: C.white,
  },
  cardBadgeLbl: {
    fontSize: 5,
    fontWeight: 900,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  // ─── Page number footer ──────────────────────────────────────────────────
  pageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerLogo: {
    fontSize: 9,
    fontWeight: 900,
    color: C.navy,
    letterSpacing: 1,
  },
  footerUrl: {
    fontSize: 8,
    color: C.textMid,
  },
});

export const BrandIndexPages = ({
  products,
  groupedBrands,
}: {
  products: Product[];
  groupedBrands: BrandGroup[];
}) => {
  // 3 cards per row, 6 rows per page = 18 brands per page
  const CARDS_PER_ROW = 3;
  const ROWS_PER_PAGE = 7;
  const CHUNK_SIZE = CARDS_PER_ROW * ROWS_PER_PAGE; // 21

  const chunks: BrandGroup[][] = [];
  for (let i = 0; i < groupedBrands.length; i += CHUNK_SIZE) {
    chunks.push(groupedBrands.slice(i, i + CHUNK_SIZE));
  }

  const totalGroups = groupedBrands.reduce((acc, b) => acc + b.groupCount, 0);

  return chunks.map((chunk, pageIndex) => {
    // Build rows of 3
    const rows: BrandGroup[][] = [];
    for (let i = 0; i < chunk.length; i += CARDS_PER_ROW) {
      rows.push(chunk.slice(i, i + CARDS_PER_ROW));
    }

    return (
      <Page key={`brand-index-${pageIndex}`} size="A4" style={styles.page} wrap={false}>
        <Image src={SAYFA_DUZENI} style={PAGE_BG_STYLE} />
        <View style={styles.pageInner}>
        <View style={styles.shell}>
          {/* Header — first page only */}
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.eyebrow}>INDEX · DİZİN</Text>
              <View style={styles.titleBlock}>
                <Text style={styles.titleMain}>MARKA LİSTESİ</Text>
                <Text style={styles.titleSub}> · BRAND INDEX</Text>
              </View>
              <Text style={styles.desc}>
                Tüm markalar alfabetik sırayla listelendi. Her markanın yanında katalog içindeki
                toplam ürün sayısı gösterilmektedir.
              </Text>
              <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{groupedBrands.length}</Text>
                  <Text style={styles.summaryLbl}>MARKA</Text>
                </View>
                <View style={styles.summaryDot} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{products.length.toString()}</Text>
                  <Text style={styles.summaryLbl}>ÜRÜN</Text>
                </View>
                <View style={styles.summaryDot} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{totalGroups.toString()}</Text>
                  <Text style={styles.summaryLbl}>GRUP</Text>
                </View>
              </View>
            </View>
          )}

          {/* Grid of brand cards */}
          <View style={{ marginTop: pageIndex === 0 ? 0 : 10 }}>
            {rows.map((row, rowIdx) => {
              // Pad row to always have CARDS_PER_ROW items for consistent spacing
              const padded = [...row];
              while (padded.length < CARDS_PER_ROW) padded.push(null as unknown as BrandGroup);

              return (
                <View key={`row-${rowIdx}`} style={styles.gridRow}>
                  {padded.map((brandObj, itemIdx) => {
                    const absoluteIndex =
                      pageIndex * CHUNK_SIZE + rowIdx * CARDS_PER_ROW + itemIdx;
                    const idxStr = String(absoluteIndex + 1).padStart(2, "0");

                    if (!brandObj) {
                      // Empty placeholder for layout consistency
                      return (
                        <View
                          key={`empty-${itemIdx}`}
                          style={[styles.card, { backgroundColor: "transparent", borderWidth: 0 }]}
                        />
                      );
                    }

                    return (
                      <View key={brandObj.brand} style={styles.card}>
                        <View style={styles.cardOrangeBar} />
                        <View style={styles.cardBody}>
                          <View style={styles.cardLeft}>
                            <Text style={styles.cardNo}>{idxStr}</Text>
                            <Text style={styles.cardName}>{brandObj.brand}</Text>
                            <Text style={styles.cardMeta}>{brandObj.groupCount} GRUP</Text>
                          </View>
                          <View style={styles.cardBadge}>
                            <Text style={styles.cardBadgeNum}>{brandObj.productCount}</Text>
                            <Text style={styles.cardBadgeLbl}>ÜRÜN</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {/* Page footer */}
        <View style={styles.pageFooter}>
          {LOGO_DATA && <Image src={LOGO_DATA} style={{ width: 60, height: 20, objectFit: "contain" }} />}
          <Text style={styles.footerUrl}>www.torqon.com.tr</Text>
        </View>
        </View>
      </Page>
    );
  });
};
