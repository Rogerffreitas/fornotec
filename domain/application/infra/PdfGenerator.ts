import { DocumentDefinitions } from "./DocumentDefinitions";

/** Interface de geração de PDF. Implementação: PdfLibPdfGenerator (pdf-lib). */
export interface PdfGenerator {
  generate(definitions: DocumentDefinitions): Promise<Uint8Array>;
}
