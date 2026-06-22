/**
 * Extended metadata for products to support future column additions in Excel
 * without breaking the core type system.
 */
export interface ProductMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface Product {
  id: string; // Required in DB, optional only on creation
  marka_adi: string;
  mepak_kodu: string;
  tanim_tr: string;
  tanim_en: string;
  resim_kodlari: string;
  oem_no: string;
  model: string;
  model_yil: string;
  
  // Technical Specs (Core)
  koni_capi_c?: string;
  govde_disi_d1?: string;
  mafsal_disi_d2?: string;
  boru_capi_d?: string;
  eksen_mesafesi_l1?: string;
  dist_capi_d3?: string;
  delik_capi_h1?: string;
  delik_eksen_mesafesi_l2?: string;
  
  // Cross References (Core)
  bagen_no?: string;
  rota_no?: string;
  egerot_no?: string;
  ditas_no?: string;
  ayd_no?: string;
  sem_no?: string;
  sampa_no?: string;
  lemforder_no?: string;
  trw_no?: string;
  febi_no?: string;
  cei_no?: string;
  delphi_no?: string;
  dt_no?: string;
  emmerre_no?: string;
  federal_mogul_no?: string;
  pe_automotive_no?: string;
  samko_no?: string;
  automann_no?: string;
  dayton_no?: string;
  meritor_no?: string;
  
  /**
   * Extensible field for any columns present in Excel but not explicitly defined here.
   * Stored as JSONB in Supabase.
   */
  metadata?: ProductMetadata;

  created_at?: string;
  updated_at?: string;
  sync_token?: string;

  // New Admin Fields
  cross_no?: string;
  uyumlu_modeller?: string;
  koli_adet?: number;
  koli_agirlik?: number;
  koli_hacim?: number;

  category?: string;
}

export type Category = string;
export type Brand = string;
export type Model = string;

export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  model?: string;
  page?: number;
  all?: boolean;
}

export interface SearchResult {
  data: Product[];
  totalCount: number;
  cappedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isCapped: boolean;
}
