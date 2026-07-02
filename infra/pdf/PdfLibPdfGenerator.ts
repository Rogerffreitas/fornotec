import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PdfGenerator } from "../../domain/application/infra/PdfGenerator";
import { DocumentDefinitions } from "../../domain/application/infra/DocumentDefinitions";

const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4
const MARGIN = 50;
const LINE_HEIGHT = 16;

export class PdfLibPdfGenerator implements PdfGenerator {
  async generate(definitions: DocumentDefinitions): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    let page = doc.addPage(PAGE_SIZE);
    let y = PAGE_SIZE[1] - MARGIN;

    const ensureSpace = () => {
      if (y < MARGIN + LINE_HEIGHT) {
        page = doc.addPage(PAGE_SIZE);
        y = PAGE_SIZE[1] - MARGIN;
      }
    };

    const drawLine = (text: string, options: { bold?: boolean; size?: number; color?: [number, number, number] } = {}) => {
      ensureSpace();
      page.drawText(text, {
        x: MARGIN,
        y,
        size: options.size ?? 11,
        font: options.bold ? fontBold : font,
        color: options.color ? rgb(...options.color) : rgb(0.11, 0.12, 0.15),
      });
      y -= LINE_HEIGHT;
    };

    drawLine(definitions.title, { bold: true, size: 18 });
    y -= 4;
    if (definitions.subtitle) {
      drawLine(definitions.subtitle, { size: 11, color: [0.42, 0.45, 0.5] });
      y -= 8;
    }

    for (const section of definitions.sections) {
      y -= 6;
      if (section.heading) {
        drawLine(section.heading, { bold: true, size: 13 });
      }
      for (const line of section.lines) {
        drawLine(line);
      }
    }

    return doc.save();
  }
}
