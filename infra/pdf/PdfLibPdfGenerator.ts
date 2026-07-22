import { Asset } from 'expo-asset';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { PdfGenerator } from '../../domain/application/infra/PdfGenerator';
import { DocumentDefinitions, DocumentSignatureBlock } from '../../domain/application/infra/DocumentDefinitions';

const LOGO_MODULE = require('../../assets/images/logo.png');

const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_SIZE[0] - MARGIN * 2;
const LINE_HEIGHT = 14;
const BAND_HEIGHT = 80;

/** Identidade visual da Fornotec (ver infra/pdf/Guara-Jacarecanga.pdf, relatório de referência). */
const BRAND_GREEN = rgb(2 / 255, 47 / 255, 26 / 255);
const BRAND_ORANGE = rgb(236 / 255, 72 / 255, 50 / 255);
const GRAY_FILL = rgb(233 / 255, 233 / 255, 233 / 255);
const GRAY_BORDER = rgb(0.72, 0.72, 0.72);
const TEXT_DARK = rgb(0.06, 0.06, 0.06);
const TEXT_MUTED = rgb(0.35, 0.37, 0.4);
const WHITE = rgb(1, 1, 1);

const INFO_LABEL_WIDTH = 150;
const TABLE_CELL_PADDING = 4;
const TABLE_HEADER_SIZE = 9;
const TABLE_BODY_SIZE = 8.5;
const TABLE_LINE_HEIGHT = 11;

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(attempt, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export class PdfLibPdfGenerator implements PdfGenerator {
  async generate(definitions: DocumentDefinitions): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const logoAsset = Asset.fromModule(LOGO_MODULE);
    await logoAsset.downloadAsync();
    const logoBytes = new Uint8Array(
      await (await fetch(logoAsset.localUri ?? logoAsset.uri)).arrayBuffer(),
    );
    const logoImage = await doc.embedPng(logoBytes);

    let page: PDFPage;
    let y = 0;

    const drawBand = () => {
      page.drawRectangle({
        x: 0,
        y: PAGE_SIZE[1] - BAND_HEIGHT,
        width: PAGE_SIZE[0],
        height: BAND_HEIGHT,
        color: BRAND_GREEN,
      });

      const brand = 'Fornotec';
      const brandSize = 26;
      const brandWidth = fontBold.widthOfTextAtSize(brand, brandSize);
      const brandBaselineY = PAGE_SIZE[1] - 34;

      const logoHeight = 30;
      const logoWidth = logoHeight * (logoImage.width / logoImage.height);
      const logoGap = 10;

      const groupWidth = logoWidth + logoGap + brandWidth;
      const groupX = (PAGE_SIZE[0] - groupWidth) / 2;
      const capHeight = brandSize * 0.72;

      page.drawImage(logoImage, {
        x: groupX,
        y: brandBaselineY + (capHeight - logoHeight) / 2,
        width: logoWidth,
        height: logoHeight,
      });

      page.drawText(brand, {
        x: groupX + logoWidth + logoGap,
        y: brandBaselineY,
        size: brandSize,
        font: fontBold,
        color: BRAND_ORANGE,
      });

      const titleSize = 12;
      const titleWidth = fontBold.widthOfTextAtSize(definitions.title, titleSize);
      page.drawText(definitions.title, {
        x: (PAGE_SIZE[0] - titleWidth) / 2,
        y: PAGE_SIZE[1] - 54,
        size: titleSize,
        font: fontBold,
        color: WHITE,
      });

      if (definitions.subtitle) {
        const subtitleSize = 9.5;
        const subtitleWidth = font.widthOfTextAtSize(definitions.subtitle, subtitleSize);
        page.drawText(definitions.subtitle, {
          x: (PAGE_SIZE[0] - subtitleWidth) / 2,
          y: PAGE_SIZE[1] - 68,
          size: subtitleSize,
          font,
          color: WHITE,
        });
      }
    };

    const newPage = () => {
      page = doc.addPage(PAGE_SIZE);
      drawBand();
      y = PAGE_SIZE[1] - BAND_HEIGHT - 24;
    };

    const ensureSpace = (height: number) => {
      if (y - height < MARGIN) newPage();
    };

    const drawLine = (
      text: string,
      options: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> } = {},
    ) => {
      const size = options.size ?? 11;
      const usedFont = options.bold ? fontBold : font;
      const color = options.color ?? TEXT_DARK;
      for (const line of wrapText(usedFont, text, size, CONTENT_WIDTH)) {
        ensureSpace(LINE_HEIGHT);
        page.drawText(line, { x: MARGIN, y, size, font: usedFont, color });
        y -= LINE_HEIGHT;
      }
    };

    const drawInfoBox = (fields: { label: string; value: string }[]) => {
      const rowHeight = 15;
      const boxHeight = fields.length * rowHeight + 12;
      ensureSpace(boxHeight + 10);
      page.drawRectangle({
        x: MARGIN,
        y: y - boxHeight,
        width: CONTENT_WIDTH,
        height: boxHeight,
        color: GRAY_FILL,
        borderColor: GRAY_BORDER,
        borderWidth: 0.75,
      });
      let rowY = y - 16;
      for (const field of fields) {
        page.drawText(field.label, {
          x: MARGIN + 10,
          y: rowY,
          size: 10,
          font: fontBold,
          color: TEXT_DARK,
        });
        page.drawText(field.value, {
          x: MARGIN + INFO_LABEL_WIDTH,
          y: rowY,
          size: 10,
          font,
          color: TEXT_DARK,
        });
        rowY -= rowHeight;
      }
      y -= boxHeight + 14;
    };

    const drawTable = (columns: { header: string; weight?: number }[], rows: string[][]) => {
      const totalWeight = columns.reduce((sum, c) => sum + (c.weight ?? 1), 0);
      const colWidths = columns.map((c) => ((c.weight ?? 1) / totalWeight) * CONTENT_WIDTH);
      const colX: number[] = [];
      colWidths.reduce((x, w) => {
        colX.push(x);
        return x + w;
      }, MARGIN);

      const drawHeaderRow = () => {
        const headerHeight = TABLE_LINE_HEIGHT + TABLE_CELL_PADDING * 2;
        ensureSpace(headerHeight);
        columns.forEach((col, i) => {
          page.drawRectangle({
            x: colX[i],
            y: y - headerHeight,
            width: colWidths[i],
            height: headerHeight,
            color: GRAY_FILL,
            borderColor: GRAY_BORDER,
            borderWidth: 0.75,
          });
          page.drawText(col.header, {
            x: colX[i] + TABLE_CELL_PADDING,
            y: y - TABLE_CELL_PADDING - TABLE_LINE_HEIGHT + 3,
            size: TABLE_HEADER_SIZE,
            font: fontBold,
            color: TEXT_DARK,
          });
        });
        y -= headerHeight;
      };

      drawHeaderRow();

      for (const row of rows) {
        const wrappedCells = row.map((cell, i) =>
          wrapText(font, cell, TABLE_BODY_SIZE, colWidths[i] - TABLE_CELL_PADDING * 2),
        );
        const lineCount = Math.max(...wrappedCells.map((lines) => lines.length));
        const rowHeight = lineCount * TABLE_LINE_HEIGHT + TABLE_CELL_PADDING * 2;

        if (y - rowHeight < MARGIN) {
          newPage();
          drawHeaderRow();
        }

        columns.forEach((_col, i) => {
          page.drawRectangle({
            x: colX[i],
            y: y - rowHeight,
            width: colWidths[i],
            height: rowHeight,
            borderColor: GRAY_BORDER,
            borderWidth: 0.75,
          });
          wrappedCells[i].forEach((line, lineIndex) => {
            page.drawText(line, {
              x: colX[i] + TABLE_CELL_PADDING,
              y: y - TABLE_CELL_PADDING - TABLE_LINE_HEIGHT * (lineIndex + 1) + 3,
              size: TABLE_BODY_SIZE,
              font,
              color: TEXT_DARK,
            });
          });
        });
        y -= rowHeight;
      }
      y -= 10;
    };

    const drawSignatureBlock = (block: DocumentSignatureBlock) => {
      const boxWidth = 220;
      const boxHeight = 70;
      ensureSpace(boxHeight + 3 * LINE_HEIGHT);

      page.drawRectangle({
        x: MARGIN,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: GRAY_BORDER,
        borderWidth: 0.75,
      });

      const scale = Math.min(
        block.strokesWidth > 0 ? boxWidth / block.strokesWidth : 1,
        block.strokesHeight > 0 ? boxHeight / block.strokesHeight : 1,
      );
      const drawnWidth = block.strokesWidth * scale;
      const drawnHeight = block.strokesHeight * scale;
      const offsetX = MARGIN + (boxWidth - drawnWidth) / 2;
      const offsetY = y - boxHeight + (boxHeight - drawnHeight) / 2;

      for (const stroke of block.strokes) {
        for (let i = 1; i < stroke.length; i++) {
          const p1 = stroke[i - 1];
          const p2 = stroke[i];
          page.drawLine({
            start: { x: offsetX + p1.x * scale, y: offsetY + drawnHeight - p1.y * scale },
            end: { x: offsetX + p2.x * scale, y: offsetY + drawnHeight - p2.y * scale },
            thickness: 1,
            color: TEXT_DARK,
          });
        }
      }

      y -= boxHeight + LINE_HEIGHT;
      drawLine(block.label, { size: 10, color: TEXT_MUTED });
      drawLine(`Nome: ${block.name}`, { size: 10, bold: true });
    };

    newPage();

    if (definitions.infoBox?.length) {
      drawInfoBox(definitions.infoBox);
    }

    for (const section of definitions.sections) {
      ensureSpace(LINE_HEIGHT + 6);
      y -= 6;
      if (section.heading) {
        drawLine(section.heading, { bold: true, size: 13, color: BRAND_GREEN });
      }
      for (const line of section.lines ?? []) {
        drawLine(line, { size: 10, color: TEXT_MUTED });
      }
      if (section.table) {
        drawTable(section.table.columns, section.table.rows);
      }
    }

    if (definitions.signatureBlock) {
      y -= 10;
      drawSignatureBlock(definitions.signatureBlock);
    }

    if (definitions.footerLines?.length) {
      ensureSpace(20);
      y -= 20;
      for (const line of definitions.footerLines) {
        drawLine(line, { size: 10 });
      }
    }

    return doc.save();
  }
}
