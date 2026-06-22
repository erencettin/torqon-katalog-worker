import React from "react";
import { Document } from "@react-pdf/renderer";
import { BrandGroup, Product } from "@/lib/catalog-data";
import { BrandIndexPages } from "./BrandIndexPage";
import { ProductPages } from "./ProductPages";

// Marka listesi (brand index) chunk — intro PDF'ler generator'da ayrıca eklenir
export const getCoverAndIndexChunk = (products: Product[], groupedBrands: BrandGroup[]) => {
  return (
    <Document>
      {BrandIndexPages({ products, groupedBrands })}
    </Document>
  );
};

export const getProductChunk = (
  groupedBrands: BrandGroup[],
  qrMap: Map<string, string>,
  imgMap: Map<string, string>
) => {
  return (
    <Document>
      {ProductPages({ groupedBrands, qrMap, imgMap })}
    </Document>
  );
};
