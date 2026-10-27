import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb } from "pdf-lib";
import type { PageData, PaperColor, Stroke } from "../types";

export async function initPdfWorker() {
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
  }
}

export async function renderPdfPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ title: string; pages: { renderDataUrl: string; width: number; height: number; pageIndex: number }[] }> {
  await initPdfWorker();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const renderedPages: { renderDataUrl: string; width: number; height: number; pageIndex: number }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    // 2x scale for crisp handwriting resolution
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
        canvas: canvas as any,
      } as any).promise;

      renderedPages.push({
        renderDataUrl: canvas.toDataURL("image/png"),
        width: viewport.width,
        height: viewport.height,
        pageIndex: i - 1,
      });
    }

    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    pages: renderedPages,
  };
}

// Render ink strokes to a transparent PNG data URL for embedding into PDF
export function renderStrokesToPng(strokes: Stroke[], width: number, height: number): string | null {
  if (!strokes || strokes.length === 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;

    ctx.save();
    if (stroke.isHighlighter) {
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = "multiply";
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.strokeStyle = stroke.color;

    if (stroke.isStraightLine && stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (stroke.points.length === 1) {
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    // Bezier curve smoothing for natural pen strokes
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      const pressure = p2.pressure ?? 0.5;
      ctx.lineWidth = Math.max(1, stroke.width * (0.35 + pressure * 1.3));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

export async function exportNotebookAsPdf(
  pages: PageData[],
  notebookTitle: string,
  paperColor: PaperColor = "dark",
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(notebookTitle);

  // Standard A4 dimensions in PDF points (72 DPI)
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (let i = 0; i < pages.length; i++) {
    const pageData = pages[i];
    let pdfPage;

    if (pageData.type === "pdf" && pageData.pdfPageRenderDataUrl) {
      // Calculate aspect ratio
      const aspectRatio = pageData.width / pageData.height;
      let pageW = A4_WIDTH;
      let pageH = A4_WIDTH / aspectRatio;

      if (pageH > A4_HEIGHT) {
        pageH = A4_HEIGHT;
        pageW = A4_HEIGHT * aspectRatio;
      }

      pdfPage = pdfDoc.addPage([pageW, pageH]);

      // Embed original PDF page render
      const bgImageBytes = await fetch(pageData.pdfPageRenderDataUrl).then((r) => r.arrayBuffer());
      const embeddedBgImage = await pdfDoc.embedPng(bgImageBytes);
      pdfPage.drawImage(embeddedBgImage, {
        x: 0,
        y: 0,
        width: pageW,
        height: pageH,
      });

      // Embed handwritten ink layer if any
      const inkPng = renderStrokesToPng(pageData.strokes, pageData.width, pageData.height);
      if (inkPng) {
        const inkBytes = await fetch(inkPng).then((r) => r.arrayBuffer());
        const embeddedInk = await pdfDoc.embedPng(inkBytes);
        pdfPage.drawImage(embeddedInk, {
          x: 0,
          y: 0,
          width: pageW,
          height: pageH,
        });
      }
    } else {
      // Inserted Blank / Ruled / Grid A4 Sheet
      pdfPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

      // Draw paper background color
      if (paperColor === "dark") {
        pdfPage.drawRectangle({
          x: 0,
          y: 0,
          width: A4_WIDTH,
          height: A4_HEIGHT,
          color: rgb(0.1, 0.1, 0.1),
        });
      } else if (paperColor === "sepia") {
        pdfPage.drawRectangle({
          x: 0,
          y: 0,
          width: A4_WIDTH,
          height: A4_HEIGHT,
          color: rgb(0.98, 0.96, 0.92),
        });
      }

      // Draw ruled lines if ruled
      if (pageData.paperStyle === "ruled") {
        const lineColor = paperColor === "dark" ? rgb(0.22, 0.22, 0.25) : rgb(0.82, 0.88, 0.95);
        const marginColor = rgb(0.9, 0.4, 0.4);

        // Horizontal notebook lines
        const lineSpacing = 24;
        for (let y = 60; y < A4_HEIGHT - 40; y += lineSpacing) {
          pdfPage.drawLine({
            start: { x: 40, y },
            end: { x: A4_WIDTH - 40, y },
            thickness: 0.75,
            color: lineColor,
          });
        }

        // Left margin line
        pdfPage.drawLine({
          start: { x: 90, y: 30 },
          end: { x: 90, y: A4_HEIGHT - 30 },
          thickness: 1,
          color: marginColor,
        });
      } else if (pageData.paperStyle === "grid") {
        const gridColor = paperColor === "dark" ? rgb(0.2, 0.2, 0.22) : rgb(0.88, 0.88, 0.92);
        const gridSize = 18;

        for (let x = 30; x <= A4_WIDTH - 30; x += gridSize) {
          pdfPage.drawLine({
            start: { x, y: 30 },
            end: { x, y: A4_HEIGHT - 30 },
            thickness: 0.5,
            color: gridColor,
          });
        }
        for (let y = 30; y <= A4_HEIGHT - 30; y += gridSize) {
          pdfPage.drawLine({
            start: { x: 30, y },
            end: { x: A4_WIDTH - 30, y },
            thickness: 0.5,
            color: gridColor,
          });
        }
      }

      // Embed handwritten ink
      const inkPng = renderStrokesToPng(pageData.strokes, pageData.width, pageData.height);
      if (inkPng) {
        const inkBytes = await fetch(inkPng).then((r) => r.arrayBuffer());
        const embeddedInk = await pdfDoc.embedPng(inkBytes);
        pdfPage.drawImage(embeddedInk, {
          x: 0,
          y: 0,
          width: A4_WIDTH,
          height: A4_HEIGHT,
        });
      }
    }

    if (onProgress) {
      onProgress(i + 1, pages.length);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
