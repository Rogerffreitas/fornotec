/**
 * Modelo de conteúdo agnóstico de biblioteca para geração de documentos PDF.
 * Um PdfGenerator concreto (ex: PdfLibPdfGenerator) sabe transformar isto em bytes de PDF.
 */
export interface DocumentInfoField {
  label: string;
  value: string;
}

export interface DocumentTableColumn {
  header: string;
  /** Peso relativo da largura da coluna (não precisa somar 1 — é normalizado). */
  weight?: number;
}

export interface DocumentTable {
  columns: DocumentTableColumn[];
  rows: string[][];
}

export interface DocumentSection {
  heading?: string;
  lines?: string[];
  table?: DocumentTable;
}

export interface DocumentDefinitions {
  title: string;
  subtitle?: string;
  /** Bloco "rótulo: valor" em destaque (fundo cinza), exibido logo após o cabeçalho. */
  infoBox?: DocumentInfoField[];
  sections: DocumentSection[];
  /** Bloco final do documento (ex: linhas de assinatura), sempre após todas as sections. */
  footerLines?: string[];
}
