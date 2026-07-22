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

export interface DocumentSignatureBlock {
  /** Rótulo acima da assinatura, ex: "Assinatura do Responsável / Cliente". */
  label: string;
  /** Nome digitado por quem assinou. */
  name: string;
  /** Traços do desenho (vetor) capturados no SignaturePad — não é uma imagem rasterizada. */
  strokes: { x: number; y: number }[][];
  /** Tamanho (mesma unidade dos pontos de `strokes`) do canvas onde a assinatura foi desenhada. */
  strokesWidth: number;
  strokesHeight: number;
}

export interface DocumentDefinitions {
  title: string;
  subtitle?: string;
  /** Bloco "rótulo: valor" em destaque (fundo cinza), exibido logo após o cabeçalho. */
  infoBox?: DocumentInfoField[];
  sections: DocumentSection[];
  /** Assinatura capturada digitalmente (ex: ao finalizar uma ordem de serviço), desenhada no lugar de uma linha em branco. */
  signatureBlock?: DocumentSignatureBlock;
  /** Bloco final do documento (ex: linhas de assinatura), sempre após todas as sections. */
  footerLines?: string[];
}
