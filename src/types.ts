export type PageType = "pdf" | "blank" | "ruled" | "grid" | "dots";

export type PaperStyle = "plain" | "ruled" | "grid" | "dots";

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  width: number;
  isHighlighter?: boolean;
  isRainbow?: boolean;
  isGalaxy?: boolean;
  points: Point[];
}

export interface PageData {
  id: string;
  title: string;
  date: string;
  type: PageType;
  paperStyle: PaperStyle;
  pdfPageIndex?: number; // 0-based index if page is from PDF
  pdfPageRenderDataUrl?: string; // High-res rendered image of the PDF page
  width: number;
  height: number;
  strokes: Stroke[];
  redoStrokes: Stroke[];
}

export interface SectionData {
  id: string;
  name: string;
  color: string; // Hex or tailwind color for left vertical pill
  pages: PageData[];
}

export interface NotebookData {
  id: string;
  title: string;
  sections: SectionData[];
}

export type ActiveToolType =
  | "select"
  | "pen"
  | "highlighter"
  | "stroke-eraser"
  | "precision-eraser"
  | "pan";

export interface PenPreset {
  id: string;
  name: string;
  color: string;
  width: number;
  isHighlighter?: boolean;
  isRainbow?: boolean;
  isGalaxy?: boolean;
}

export type PaperColor = "dark" | "white" | "sepia" | "yellow" | "mint" | "pink";
