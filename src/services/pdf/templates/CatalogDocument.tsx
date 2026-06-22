import React from "react";
import { Document } from "@react-pdf/renderer";
import { BrandGroup, Product } from "@/lib/catalog-data";
import { CoverPage } from "./CoverPage";
import { BrandIndexPages } from "./BrandIndexPage";
import { ProductPages } from "./ProductPages";

type CatalogDocumentProps = {
  products: Product[];
  groupedBrands: BrandGroup[];
  qrMap?: Map<string, string>;
  imgMap?: Map<string, string>;
};

export const CatalogDocument = ({
  products,
  groupedBrands,
  qrMap = new Map(),
  imgMap = new Map(),
}: CatalogDocumentProps) => {
  return (
    <Document>
      <CoverPage products={products} groupedBrands={groupedBrands} />
      {BrandIndexPages({ products, groupedBrands })}
      {ProductPages({ groupedBrands, qrMap, imgMap })}
    </Document>
  );
};
