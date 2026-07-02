/**
 * Modelo de conteúdo agnóstico de biblioteca para geração de documentos PDF.
 * Um PdfGenerator concreto (ex: PdfLibPdfGenerator) sabe transformar isto em bytes de PDF.
 */
export interface DocumentSection {
  heading?: string;
  lines: string[];
}

export interface DocumentDefinitions {
  title: string;
  subtitle?: string;
  sections: DocumentSection[];
}
