import React, { useRef } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { Plus, AlignLeft, Upload } from "lucide-react";
import type { PageData, ActiveToolType, PaperColor, PaperStyle, Stroke } from "../types";

interface OneNoteWorkspaceProps {
  page: PageData | null;
  pageIndex: number;
  totalPages: number;
  activeTool: ActiveToolType;
  currentColor: string;
  currentWidth: number;
  isHighlighter: boolean;
  isRainbow: boolean;
  isGalaxy: boolean;
  palmRejection: boolean;
  pressureSensitivity: boolean;
  paperColor: PaperColor;
  paperStyle: PaperStyle;
  zoom: number;
  setZoom: (z: number) => void;
  onStrokeComplete: (stroke: Stroke) => void;
  onStrokeErase: (strokeId: string) => void;
  onPageTitleChange: (newTitle: string) => void;
  onAddBlankA4Page: (style: PaperStyle, insertAfterPageId?: string) => void;
  onUploadPdfClick: () => void;
}

export const OneNoteWorkspace: React.FC<OneNoteWorkspaceProps> = ({
  page,
  pageIndex,
  totalPages,
  activeTool,
  currentColor,
  currentWidth,
  isHighlighter,
  isRainbow,
  isGalaxy,
  palmRejection,
  pressureSensitivity,
  paperColor,
  paperStyle,
  zoom,
  setZoom,
  onStrokeComplete,
  onStrokeErase,
  onPageTitleChange,
  onAddBlankA4Page,
  onUploadPdfClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#191919] text-neutral-400 p-8 select-none">
        <div className="flex flex-col items-center max-w-md text-center gap-4 p-8 rounded-xl bg-[#202020] border border-[#2d2d2d] shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#7719aa]/20 border border-[#7719aa]/40 flex items-center justify-center text-[#a855f7] text-2xl font-bold">
            N
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">OneNote PDF Studio</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Upload your lecture PDF, homework questions, or book chapters. Insert blank A4 ruled or grid sheets anywhere, and write smoothly using your digital writing pad or stylus.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <button
              onClick={onUploadPdfClick}
              className="px-4 py-2 rounded-lg bg-[#7719aa] hover:bg-[#8822c2] text-white text-xs font-semibold shadow-lg transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </button>
            <button
              onClick={() => onAddBlankA4Page("ruled")}
              className="px-4 py-2 rounded-lg bg-[#2e2e2e] hover:bg-[#383838] text-white text-xs font-semibold border border-[#444] transition flex items-center gap-2"
            >
              <AlignLeft className="w-4 h-4 text-sky-400" />
              <span>New Ruled A4 Sheet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine paper styling CSS class
  const activePaperStyle = page.type === "pdf" ? "plain" : (page.paperStyle || paperStyle);
  let paperBgClass = "paper-plain-dark";

  if (paperColor === "white") {
    if (activePaperStyle === "ruled") paperBgClass = "paper-ruled-light";
    else if (activePaperStyle === "grid") paperBgClass = "paper-grid-light";
    else if (activePaperStyle === "dots") paperBgClass = "paper-dots-light";
    else paperBgClass = "paper-plain-light";
  } else if (paperColor === "sepia") {
    paperBgClass = "paper-sepia";
  } else {
    // Dark mode
    if (activePaperStyle === "ruled") paperBgClass = "paper-ruled-dark";
    else if (activePaperStyle === "grid") paperBgClass = "paper-grid-dark";
    else if (activePaperStyle === "dots") paperBgClass = "paper-dots-dark";
    else paperBgClass = "paper-plain-dark";
  }

  // Base A4 dimensions in px (standard A4 ratio ~ 1 : 1.414)
  const baseWidth = page.width || 794;
  const baseHeight = page.height || 1123;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full bg-[#161616] overflow-y-auto relative select-none"
    >
      {/* 1. ONENOTE PAGE HEADER (Title + Date Line identical to OneNote screenshot) */}
      <div className="sticky top-0 z-30 px-10 pt-6 pb-4 bg-[#161616]/95 backdrop-blur-sm border-b border-[#242424] max-w-4xl w-full mx-auto">
        <input
          type="text"
          value={page.title}
          onChange={(e) => onPageTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent border-none outline-none text-2xl font-normal text-white placeholder-neutral-500 tracking-tight"
        />
        <div className="w-full h-px bg-[#2e2e2e] my-2" />
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{page.date || "27 October 2026   17:19"}</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#252525] text-[11px] text-neutral-300 border border-[#333]">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 text-[11px] border border-purple-800/40">
              {page.type === "pdf" ? "PDF Document Page" : `A4 ${page.paperStyle || "Sheet"}`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN A4 SHEET CANVAS CONTAINER */}
      <div className="flex-1 flex flex-col items-center py-6 px-4">
        <div
          className={`relative rounded shadow-2xl transition-all border ${
            paperColor === "white"
              ? "border-neutral-300 text-black"
              : paperColor === "sepia"
              ? "border-[#d8caa8] text-neutral-900"
              : "border-[#2e2e2e] text-white"
          } ${paperBgClass}`}
          style={{
            width: `${baseWidth * zoom}px`,
            height: `${baseHeight * zoom}px`,
            transformOrigin: "top center",
          }}
        >
          {/* PDF Page Background Render if PDF page */}
          {page.type === "pdf" && page.pdfPageRenderDataUrl && (
            <img
              src={page.pdfPageRenderDataUrl}
              alt={`PDF Page ${pageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
              draggable={false}
            />
          )}

          {/* Interactive Writing Pad / Drawing Canvas Layer */}
          <DrawingCanvas
            width={baseWidth}
            height={baseHeight}
            strokes={page.strokes}
            activeTool={activeTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
            isHighlighter={isHighlighter}
            isRainbow={isRainbow}
            isGalaxy={isGalaxy}
            palmRejection={palmRejection}
            pressureSensitivity={pressureSensitivity}
            onStrokeComplete={onStrokeComplete}
            onStrokeErase={onStrokeErase}
            scale={zoom}
          />
        </div>

        {/* 3. IN-BETWEEN "INSERT A4 BLANK SHEET HERE" BUTTON */}
        <div className="flex items-center gap-2 my-8">
          <div className="h-px w-20 bg-[#2d2d2d]" />
          <button
            onClick={() => onAddBlankA4Page("plain", page.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252525] hover:bg-purple-900/40 border border-[#383838] hover:border-purple-500/50 text-xs text-neutral-300 hover:text-purple-200 transition shadow"
            title="Insert a blank A4 sheet right below this page"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Insert Blank A4 Sheet Below</span>
          </button>
          <button
            onClick={() => onAddBlankA4Page("ruled", page.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252525] hover:bg-sky-900/40 border border-[#383838] hover:border-sky-500/50 text-xs text-neutral-300 hover:text-sky-200 transition shadow"
            title="Insert a lined notebook A4 sheet right below this page"
          >
            <AlignLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Insert Ruled A4 Sheet</span>
          </button>
          <div className="h-px w-20 bg-[#2d2d2d]" />
        </div>
      </div>

      {/* 4. FLOATING HUD (Zoom, Stylus Status, Quick Inking Info) */}
      <div className="fixed bottom-4 right-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#202020]/90 backdrop-blur border border-[#353535] text-xs text-neutral-300 shadow-xl">
        <button
          onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
          className="w-6 h-6 rounded-full hover:bg-[#333] flex items-center justify-center font-bold"
          title="Zoom Out"
        >
          -
        </button>
        <span className="font-semibold text-neutral-200 w-11 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
          className="w-6 h-6 rounded-full hover:bg-[#333] flex items-center justify-center font-bold"
          title="Zoom In"
        >
          +
        </button>
        <div className="h-4 w-px bg-[#3e3e3e] mx-1" />
        <button
          onClick={() => setZoom(1.0)}
          className="px-2 py-0.5 rounded hover:bg-[#333] text-[11px] text-neutral-400 hover:text-white"
        >
          100%
        </button>
      </div>
    </div>
  );
};
