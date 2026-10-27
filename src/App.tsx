import React, { useState, useEffect, useRef } from "react";
import { OneNoteRibbon } from "./components/OneNoteRibbon";
import { OneNoteSidebar } from "./components/OneNoteSidebar";
import { OneNoteWorkspace } from "./components/OneNoteWorkspace";
import { renderPdfPages, exportNotebookAsPdf, downloadPdf } from "./utils/pdfEngine";
import type {
  PageData,
  SectionData,
  ActiveToolType,
  PaperColor,
  PaperStyle,
  Stroke,
} from "./types";

const INITIAL_SECTIONS: SectionData[] = [
  {
    id: "sec-8th",
    name: "8th",
    color: "#22c55e",
    pages: [
      {
        id: "p-hecu107",
        title: "hecu107",
        date: "27 October 2026   17:19",
        type: "ruled",
        paperStyle: "ruled",
        width: 794,
        height: 1123,
        strokes: [],
        redoStrokes: [],
      },
      {
        id: "p-maths-ch6",
        title: "Maths-part-1-ch-6",
        date: "27 October 2026   17:19",
        type: "grid",
        paperStyle: "grid",
        width: 794,
        height: 1123,
        strokes: [],
        redoStrokes: [],
      },
      {
        id: "p-dot",
        title: ".",
        date: "27 October 2026   17:19",
        type: "blank",
        paperStyle: "plain",
        width: 794,
        height: 1123,
        strokes: [],
        redoStrokes: [],
      },
      {
        id: "p-untitled",
        title: "Untitled",
        date: "27 October 2026   17:19",
        type: "ruled",
        paperStyle: "ruled",
        width: 794,
        height: 1123,
        strokes: [],
        redoStrokes: [],
      },
    ],
  },
  { id: "sec-bca", name: "BCA-2026", color: "#22c55e", pages: [] },
  { id: "sec-phy12", name: "phy 12th", color: "#0284c7", pages: [] },
  { id: "sec-hist12", name: "History 12th", color: "#92400e", pages: [] },
  { id: "sec-math11", name: "Maths 11th", color: "#ea580c", pages: [] },
  { id: "sec-math10", name: "10th Maths", color: "#0284c7", pages: [] },
  { id: "sec-sci9", name: "Science 9th", color: "#9333ea", pages: [] },
  { id: "sec-eng", name: "English Grammar", color: "#92400e", pages: [] },
  { id: "sec-5th", name: "5th", color: "#22c55e", pages: [] },
  { id: "sec-4th", name: "4th", color: "#0284c7", pages: [] },
  { id: "sec-3rd", name: "3rd", color: "#22c55e", pages: [] },
  { id: "sec-reason", name: "Reasoning", color: "#9333ea", pages: [] },
  { id: "sec-7th", name: "7th", color: "#0284c7", pages: [] },
  { id: "sec-9th", name: "9th", color: "#ea580c", pages: [] },
  { id: "sec-6th", name: "6th", color: "#9333ea", pages: [] },
  { id: "sec-10th", name: "10th", color: "#9333ea", pages: [] },
];

export function App() {
  const [notebookTitle, setNotebookTitle] = useState("Maths 10th");
  const [sections, setSections] = useState<SectionData[]>(() => {
    const saved = localStorage.getItem("onenote_pdf_sections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_SECTIONS;
  });

  const [activeSectionId, setActiveSectionId] = useState<string>("sec-8th");
  const [activePageId, setActivePageId] = useState<string>("p-untitled");

  // Ribbon state
  const [activeTab, setActiveTab] = useState<"file" | "home" | "insert" | "draw" | "view" | "help">("draw");
  const [activeTool, setActiveTool] = useState<ActiveToolType>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#ffffff");
  const [currentWidth, setCurrentWidth] = useState<number>(2.0);
  const [isHighlighter, setIsHighlighter] = useState<boolean>(false);
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [isGalaxy, setIsGalaxy] = useState<boolean>(false);
  const [palmRejection, setPalmRejection] = useState<boolean>(true);
  const [pressureSensitivity, setPressureSensitivity] = useState<boolean>(true);

  // View state
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("ruled");
  const [paperColor, setPaperColor] = useState<PaperColor>("dark");
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Upload & Export Status
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("onenote_pdf_sections", JSON.stringify(sections));
    } catch {
      // storage quota or disabled
    }
  }, [sections]);

  // Current Section & Active Page
  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activePage = activeSection?.pages.find((p) => p.id === activePageId) || activeSection?.pages[0] || null;

  // Sync active page id if not found
  useEffect(() => {
    if (activeSection && activeSection.pages.length > 0 && !activeSection.pages.some((p) => p.id === activePageId)) {
      setActivePageId(activeSection.pages[0].id);
    }
  }, [activeSectionId, activeSection, activePageId]);

  // Keyboard Shortcuts: Ctrl+Z, Ctrl+Y, P, H, E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === "p") {
        setActiveTool("pen");
        setIsHighlighter(false);
      } else if (e.key.toLowerCase() === "h") {
        setActiveTool("highlighter");
        setIsHighlighter(true);
      } else if (e.key.toLowerCase() === "e") {
        setActiveTool("stroke-eraser");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Stroke Completion
  const handleStrokeComplete = (newStroke: Stroke) => {
    if (!activeSection || !activePage) return;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            return {
              ...p,
              strokes: [...p.strokes, newStroke],
              redoStrokes: [], // clear redo on new action
            };
          }),
        };
      })
    );
  };

  // Stroke Erase
  const handleStrokeErase = (strokeId: string) => {
    if (!activeSection || !activePage) return;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            return {
              ...p,
              strokes: p.strokes.filter((s) => s.id !== strokeId),
            };
          }),
        };
      })
    );
  };

  // Undo & Redo
  const handleUndo = () => {
    if (!activeSection || !activePage || activePage.strokes.length === 0) return;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            const lastStroke = p.strokes[p.strokes.length - 1];
            return {
              ...p,
              strokes: p.strokes.slice(0, -1),
              redoStrokes: [...p.redoStrokes, lastStroke],
            };
          }),
        };
      })
    );
  };

  const handleRedo = () => {
    if (!activeSection || !activePage || activePage.redoStrokes.length === 0) return;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            const strokeToRestore = p.redoStrokes[p.redoStrokes.length - 1];
            return {
              ...p,
              strokes: [...p.strokes, strokeToRestore],
              redoStrokes: p.redoStrokes.slice(0, -1),
            };
          }),
        };
      })
    );
  };

  const handleClearPageInk = () => {
    if (!activeSection || !activePage) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            return {
              ...p,
              strokes: [],
              redoStrokes: [],
            };
          }),
        };
      })
    );
  };

  // Add Blank A4 Page (Inserts blank sheet at end or right after a given page)
  const handleAddBlankA4Page = (style: PaperStyle, insertAfterPageId?: string) => {
    if (!activeSection) return;

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}   ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newPage: PageData = {
      id: "page_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title: style === "ruled" ? "Ruled Notes" : style === "grid" ? "Grid Practice" : "Untitled Page",
      date: formattedDate,
      type: style === "plain" ? "blank" : (style as any),
      paperStyle: style,
      width: 794,
      height: 1123,
      strokes: [],
      redoStrokes: [],
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;

        let updatedPages = [...sec.pages];
        if (insertAfterPageId) {
          const index = updatedPages.findIndex((p) => p.id === insertAfterPageId);
          if (index !== -1) {
            updatedPages.splice(index + 1, 0, newPage);
          } else {
            updatedPages.push(newPage);
          }
        } else {
          updatedPages.push(newPage);
        }

        return { ...sec, pages: updatedPages };
      })
    );

    setActivePageId(newPage.id);
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (!activeSection) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        const remaining = sec.pages.filter((p) => p.id !== pageId);
        return { ...sec, pages: remaining };
      })
    );
  };

  // Page Title Change
  const handlePageTitleChange = (newTitle: string) => {
    if (!activeSection || !activePage) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSection.id) return sec;
        return {
          ...sec,
          pages: sec.pages.map((p) => (p.id === activePage.id ? { ...p, title: newTitle } : p)),
        };
      })
    );
  };

  // Add Section
  const handleAddSection = (name: string, color: string) => {
    const newSec: SectionData = {
      id: "sec_" + Date.now(),
      name,
      color,
      pages: [],
    };
    setSections((prev) => [...prev, newSec]);
    setActiveSectionId(newSec.id);
  };

  // PDF Upload Handler
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessingPdf(true);
    setPdfProgressText(`Loading ${file.name}...`);

    try {
      const { title, pages: renderedPages } = await renderPdfPages(file, (curr, tot) => {
        setPdfProgressText(`Rendering PDF page ${curr} of ${tot}...`);
      });

      const now = new Date();
      const formattedDate = `${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}   ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newPdfPages: PageData[] = renderedPages.map((rp, idx) => ({
        id: `pdf_${Date.now()}_${idx}`,
        title: `${title} - Page ${idx + 1}`,
        date: formattedDate,
        type: "pdf",
        paperStyle: "plain",
        pdfPageIndex: rp.pageIndex,
        pdfPageRenderDataUrl: rp.renderDataUrl,
        width: rp.width,
        height: rp.height,
        strokes: [],
        redoStrokes: [],
      }));

      // Add pages to active section
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id !== activeSectionId) return sec;
          return {
            ...sec,
            pages: [...sec.pages, ...newPdfPages],
          };
        })
      );

      if (newPdfPages.length > 0) {
        setActivePageId(newPdfPages[0].id);
      }
    } catch (err: any) {
      alert("Failed to read PDF file: " + (err?.message || "Unknown error"));
    } finally {
      setIsProcessingPdf(false);
      setPdfProgressText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Export PDF Handler
  const handleExportPdf = async () => {
    if (!activeSection || activeSection.pages.length === 0) {
      alert("No pages to export in this section!");
      return;
    }

    setIsProcessingPdf(true);
    setPdfProgressText("Building modified PDF with notes and inserted blank sheets...");

    try {
      const pdfBytes = await exportNotebookAsPdf(
        activeSection.pages,
        `${notebookTitle} - ${activeSection.name}`,
        paperColor,
        (curr, tot) => {
          setPdfProgressText(`Processing page ${curr} of ${tot} into PDF...`);
        }
      );

      downloadPdf(pdfBytes, `${notebookTitle}_${activeSection.name}_Notes.pdf`);
    } catch (err: any) {
      alert("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsProcessingPdf(false);
      setPdfProgressText("");
    }
  };

  const canUndo = Boolean(activePage && activePage.strokes.length > 0);
  const canRedo = Boolean(activePage && activePage.redoStrokes.length > 0);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#161616] font-sans antialiased">
      {/* Hidden PDF file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfFileSelect}
      />

      {/* PDF Processing Overlay */}
      {isProcessingPdf && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm select-none">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#202020] border border-[#333] shadow-2xl max-w-sm text-center">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            <h3 className="text-base font-bold text-white">Working with PDF...</h3>
            <p className="text-xs text-neutral-300">{pdfProgressText}</p>
          </div>
        </div>
      )}

      {/* 1. TOP WINDOW BAR & ONENOTE RIBBON */}
      <OneNoteRibbon
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        currentWidth={currentWidth}
        setCurrentWidth={setCurrentWidth}
        isHighlighter={isHighlighter}
        setIsHighlighter={setIsHighlighter}
        isRainbow={isRainbow}
        setIsRainbow={setIsRainbow}
        isGalaxy={isGalaxy}
        setIsGalaxy={setIsGalaxy}
        palmRejection={palmRejection}
        setPalmRejection={setPalmRejection}
        pressureSensitivity={pressureSensitivity}
        setPressureSensitivity={setPressureSensitivity}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onUploadPdfClick={() => fileInputRef.current?.click()}
        onAddBlankA4Page={(style) => handleAddBlankA4Page(style, activePage?.id)}
        onClearPageInk={handleClearPageInk}
        onExportPdf={handleExportPdf}
        paperStyle={paperStyle}
        setPaperStyle={setPaperStyle}
        paperColor={paperColor}
        setPaperColor={setPaperColor}
        zoom={zoom}
        setZoom={setZoom}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        notebookTitle={notebookTitle}
        activePageTitle={activePage?.title || "Untitled"}
      />

      {/* 2. BODY CONTENT: SIDEBAR + MAIN A4 CANVAS */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Two-Column Sidebar (Sections & Pages) */}
        {!isFullscreen && (
          <OneNoteSidebar
            sections={sections}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            onAddSection={handleAddSection}
            pages={activeSection?.pages || []}
            activePageId={activePageId}
            setActivePageId={setActivePageId}
            onAddBlankA4Page={(style, insertAfterId) => handleAddBlankA4Page(style, insertAfterId)}
            onDeletePage={handleDeletePage}
            onUploadPdfClick={() => fileInputRef.current?.click()}
            notebookTitle={notebookTitle}
            setNotebookTitle={setNotebookTitle}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}

        {/* Central Writing Pad & A4 Page Workspace */}
        <OneNoteWorkspace
          page={activePage}
          pageIndex={activeSection?.pages.findIndex((p) => p.id === activePageId) ?? 0}
          totalPages={activeSection?.pages.length || 0}
          activeTool={activeTool}
          currentColor={currentColor}
          currentWidth={currentWidth}
          isHighlighter={isHighlighter}
          isRainbow={isRainbow}
          isGalaxy={isGalaxy}
          palmRejection={palmRejection}
          pressureSensitivity={pressureSensitivity}
          paperColor={paperColor}
          paperStyle={paperStyle}
          zoom={zoom}
          setZoom={setZoom}
          onStrokeComplete={handleStrokeComplete}
          onStrokeErase={handleStrokeErase}
          onPageTitleChange={handlePageTitleChange}
          onAddBlankA4Page={(style, insertAfterId) => handleAddBlankA4Page(style, insertAfterId)}
          onUploadPdfClick={() => fileInputRef.current?.click()}
        />
      </div>
    </div>
  );
}

export default App;
