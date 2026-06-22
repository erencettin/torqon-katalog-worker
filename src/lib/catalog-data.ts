import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";

export type { Product };

export type BrandGroup = {
  brand: string;
  productCount: number;
  groupCount: number;
  groups: {
    groupName: string;
    groupNameEn: string;
    products: Product[];
  }[];
};

export async function getAllProducts(brands?: string[]): Promise<Product[]> {
  const ranges: [number, number][] = [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
    [3000, 3999],
    [4000, 4999],
  ];

  const results = await Promise.all(
    ranges.map(([from, to]) => {
      let query = supabase
        .from("products")
        .select(
          "id, mepak_kodu, tanim_tr, tanim_en, marka_adi, oem_no, model, model_yil, resim_kodlari"
        )
        .range(from, to)
        .order("marka_adi", { ascending: true })
        .order("mepak_kodu", { ascending: true });

      if (brands && brands.length > 0) {
        query = query.in("marka_adi", brands);
      }

      return query;
    })
  );

  return results.flatMap((r) => (r.data || []) as Product[]);
}

export function normalizeTitle(value?: string | null) {
  return (value || "").trim();
}

export function groupProductsByBrand(products: Product[]): BrandGroup[] {
  const grouped: Record<
    string,
    Record<string, { tr: string; en: string; items: Product[] }>
  > = {};

  for (const p of products) {
    const brand = p.marka_adi?.trim() || "DİĞER MARKALAR";
    const tanimTr = normalizeTitle(p.tanim_tr) || "DİĞER ÜRÜNLER";
    const tanimEn = normalizeTitle(p.tanim_en);

    const groupNameTr = tanimTr.includes("-")
      ? tanimTr.split("-")[0].trim()
      : tanimTr;
    const groupNameEn = tanimEn.includes("-")
      ? tanimEn.split("-")[0].trim()
      : tanimEn;

    const brandKey = brand.toLocaleUpperCase("tr-TR");
    const groupKey = groupNameTr.toLocaleUpperCase("tr-TR");

    if (!grouped[brandKey]) grouped[brandKey] = {};
    if (!grouped[brandKey][groupKey]) {
      grouped[brandKey][groupKey] = {
        tr: groupNameTr,
        en: groupNameEn,
        items: [],
      };
    }

    grouped[brandKey][groupKey].items.push(p);
  }

  return Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((brand) => {
      const groups = Object.keys(grouped[brand])
        .sort((a, b) => a.localeCompare(b, "tr"))
        .map((groupKey) => ({
          groupName: grouped[brand][groupKey].tr.toLocaleUpperCase("tr-TR"),
          groupNameEn: grouped[brand][groupKey].en.toLocaleUpperCase("en-US"),
          products: grouped[brand][groupKey].items.sort((a, b) =>
            (a.mepak_kodu || "").localeCompare(b.mepak_kodu || "", "tr")
          ),
        }));

      return {
        brand,
        groups,
        productCount: groups.reduce((acc, g) => acc + g.products.length, 0),
        groupCount: groups.length,
      };
    });
}
