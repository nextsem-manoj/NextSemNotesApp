import React, { useState } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Upload,
  FilePlus2,
  Grid3X3,
  AlignLeft,
  Maximize2,
  Minimize2,
  Sliders,
  Hand,
  MousePointer,
  ChevronDown,
  Trash2,
  Smartphone,
} from "lucide-react";
import type { ActiveToolType, PaperColor, PaperStyle, PenPreset } from "../types";

interface OneNoteRibbonProps {
  activeTab: "file" | "home" | "insert" | "draw" | "view" | "help";
  setActiveTab: (tab: "file" | "home" | "insert" | "draw" | "view" | "help") => void;
  activeTool: ActiveToolType;
  setActiveTool: (tool: ActiveToolType) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentWidth: number;
  setCurrentWidth: (w: number) => void;
  isHighlighter: boolean;
  setIsHighlighter: (val: boolean) => void;
  isRainbow: boolean;
  setIsRainbow: (val: boolean) => void;
  isGalaxy: boolean;
  setIsGalaxy: (val: boolean) => void;
  palmRejection: boolean;
  setPalmRejection: (val: boolean) => void;
  pressureSensitivity: boolean;
  setPressureSensitivity: (val: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUploadPdfClick: () => void;
  onAddBlankA4Page: (style: PaperStyle) => void;
  onClearPageInk: () => void;
  onExportPdf: () => void;
  paperStyle: PaperStyle;
  setPaperStyle: (style: PaperStyle) => void;
  paperColor: PaperColor;
  setPaperColor: (color: PaperColor) => void;
  zoom: number;
  setZoom: (z: number) => void;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  notebookTitle: string;
  activePageTitle: string;
}

export const OneNoteRibbon: React.FC<OneNoteRibbonProps> = ({
  activeTab,
  setActiveTab,
  activeTool,
  setActiveTool,
  currentColor,
  setCurrentColor,
  currentWidth,
  setCurrentWidth,
  isHighlighter,
  setIsHighlighter,
  isRainbow,
  setIsRainbow,
  isGalaxy,
  setIsGalaxy,
  palmRejection,
  setPalmRejection,
  pressureSensitivity,
  setPressureSensitivity,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUploadPdfClick,
  onAddBlankA4Page,
  onClearPageInk,
  onExportPdf,
  paperStyle,
  setPaperStyle,
  paperColor,
  setPaperColor,
  zoom,
  setZoom,
  isFullscreen,
  setIsFullscreen,
  notebookTitle,
  activePageTitle,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showThicknessPicker, setShowThicknessPicker] = useState(false);

  // Pen Rack presets matching Microsoft OneNote's iconic pen shelf
  const penPresets: PenPreset[] = [
    { id: "pen-black", name: "Black Pen", color: "#ffffff", width: 2.0 },
    { id: "pen-blue", name: "Blue Pen", color: "#38bdf8", width: 2.0 },
    { id: "pen-red", name: "Red Pen", color: "#f87171", width: 2.0 },
    { id: "pen-green", name: "Green Pen", color: "#4ade80", width: 2.0 },
    { id: "pen-yellow", name: "Amber Pen", color: "#fbbf24", width: 2.0 },
    { id: "pen-rainbow", name: "Rainbow Pen", color: "#ec4899", width: 3.0, isRainbow: true },
    { id: "pen-galaxy", name: "Galaxy Pen", color: "#8b5cf6", width: 3.5, isGalaxy: true },
    { id: "hl-yellow", name: "Yellow Highlighter", color: "#facc15", width: 14.0, isHighlighter: true },
    { id: "hl-green", name: "Mint Highlighter", color: "#4ade80", width: 14.0, isHighlighter: true },
    { id: "hl-pink", name: "Pink Highlighter", color: "#f472b6", width: 14.0, isHighlighter: true },
    { id: "hl-cyan", name: "Cyan Highlighter", color: "#22d3ee", width: 14.0, isHighlighter: true },
  ];

  const oneNoteColors = [
    "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
    "#94a3b8", "#78716c", "#10b981", "#6366f1", "#d946ef"
  ];

  const thicknessOptions = [0.8, 1.5, 2.5, 4.0, 6.0, 10.0, 14.0, 20.0];

  const selectPenPreset = (preset: PenPreset) => {
    setCurrentColor(preset.color);
    setCurrentWidth(preset.width);
    setIsHighlighter(Boolean(preset.isHighlighter));
    setIsRainbow(Boolean(preset.isRainbow));
    setIsGalaxy(Boolean(preset.isGalaxy));
    setActiveTool(preset.isHighlighter ? "highlighter" : "pen");
  };

  return (
    <div className="flex flex-col bg-[#202020] border-b border-[#2e2e2e] text-[#d6d6d6] select-none shrink-0 shadow-md">
      {/* 1. TOP WINDOW BAR (OneNote Branding, Quick Access, Search, Profile) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b1b1b] border-b border-[#282828] text-xs">
        {/* Left: Purple OneNote icon & Quick Access buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#7719aa] text-white font-extrabold shadow-sm">
            N
          </div>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1 rounded hover:bg-[#2e2e2e] transition ${!canUndo ? "opacity-35 cursor-not-allowed" : "hover:text-white"}`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1 rounded hover:bg-[#2e2e2e] transition ${!canRedo ? "opacity-35 cursor-not-allowed" : "hover:text-white"}`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-[#363636] mx-1" />
          <span className="font-semibold text-[#cccccc] tracking-tight truncate max-w-[260px]">
            {notebookTitle} — {activePageTitle}
          </span>
        </div>

        {/* Center: Search pill */}
        <div className="hidden md:flex items-center w-72 h-6 px-2.5 rounded-md bg-[#282828] border border-[#383838] text-neutral-400 text-xs">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search notes, PDF pages (Ctrl+F)"
            className="w-full bg-transparent border-none outline-none ml-2 text-neutral-200 placeholder-neutral-500 text-xs"
          />
        </div>

        {/* Right: Export button, Fullscreen, and User Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#7719aa] hover:bg-[#8822c2] text-white font-medium text-xs shadow-sm transition"
            title="Download modified PDF with blank sheets and handwriting"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded hover:bg-[#2e2e2e] text-neutral-300 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Writing View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-[11px] shadow">
            M
          </div>
        </div>
      </div>

      {/* 2. RIBBON TABS (File, Home, Insert, Draw, View, Help) */}
      <div className="flex items-center gap-1 px-2 pt-1 bg-[#202020] text-xs font-normal">
        {[
          { id: "file", label: "File" },
          { id: "home", label: "Home" },
          { id: "insert", label: "Insert" },
          { id: "draw", label: "Draw" },
          { id: "view", label: "View" },
          { id: "help", label: "Help" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-t transition font-medium relative ${
                isActive
                  ? "bg-[#2b2b2b] text-white font-semibold after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-[#a855f7]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-[#252525]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. RIBBON TOOLBAR PANEL */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#2b2b2b] border-t border-[#363636] overflow-x-auto min-h-[58px]">
        {/* === DRAW TAB (Writing Pad Focus) === */}
        {activeTab === "draw" && (
          <div className="flex items-center gap-3 w-full">
            {/* Pointer / Hand tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#3a3a3a]">
              <button
                onClick={() => setActiveTool("select")}
                className={`p-1.5 rounded flex flex-col items-center justify-center text-[10px] w-12 h-11 transition ${
                  activeTool === "select" ? "bg-[#3e3e3e] text-purple-400 font-semibold" : "hover:bg-[#343434] text-neutral-300"
                }`}
                title="Select Mode"
              >
                <MousePointer className="w-4 h-4" />
                <span>Select</span>
              </button>
              <button
                onClick={() => setActiveTool("pan")}
                className={`p-1.5 rounded flex flex-col items-center justify-center text-[10px] w-12 h-11 transition ${
                  activeTool === "pan" ? "bg-[#3e3e3e] text-purple-400 font-semibold" : "hover:bg-[#343434] text-neutral-300"
                }`}
                title="Pan / Touch Scroll"
              >
                <Hand className="w-4 h-4" />
                <span>Pan</span>
              </button>
            </div>

            {/* QUICK PEN RACK (OneNote Iconic Pens Shelf) */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 bg-[#232323] rounded-md border border-[#383838]">
              {penPresets.map((pen) => {
                const isSelected =
                  ((!isHighlighter && !pen.isHighlighter && activeTool === "pen") ||
                    (isHighlighter && pen.isHighlighter && activeTool === "highlighter")) &&
                  (pen.isRainbow ? isRainbow : pen.isGalaxy ? isGalaxy : currentColor === pen.color);

                return (
                  <button
                    key={pen.id}
                    onClick={() => selectPenPreset(pen)}
                    className={`relative p-1.5 rounded transition group flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#383838] ring-1 ring-purple-400 shadow-sm"
                        : "hover:bg-[#2e2e2e]"
                    }`}
                    title={pen.name}
                  >
                    {pen.isHighlighter ? (
                      <div className="w-5 h-6 flex flex-col items-center justify-between">
                        <Highlighter className="w-3.5 h-3.5" style={{ color: pen.color }} />
                        <div
                          className="w-4 h-1.5 rounded-sm"
                          style={{ backgroundColor: pen.color, opacity: 0.8 }}
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-6 flex flex-col items-center justify-between">
                        <PenTool className="w-3.5 h-3.5" style={{ color: pen.isRainbow ? "#ec4899" : pen.isGalaxy ? "#a855f7" : pen.color }} />
                        <div
                          className={`w-3 h-1.5 rounded-full ${
                            pen.isRainbow
                              ? "bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                              : pen.isGalaxy
                              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                              : ""
                          }`}
                          style={!pen.isRainbow && !pen.isGalaxy ? { backgroundColor: pen.color } : {}}
                        />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Color & Thickness Controls */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#3a3a3a]">
              {/* Color Picker popover button */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-[#343434] text-[10px] w-12 h-11 transition"
                  title="Choose Ink Color"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-neutral-400 shadow-sm"
                    style={{ backgroundColor: currentColor }}
                  />
                  <span className="flex items-center gap-0.5 mt-0.5">
                    Color <ChevronDown className="w-2.5 h-2.5" />
                  </span>
                </button>

                {showColorPicker && (
                  <div className="absolute top-12 left-0 z-50 p-2.5 bg-[#252525] border border-[#3e3e3e] rounded-lg shadow-2xl grid grid-cols-5 gap-1.5 w-44">
                    {oneNoteColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrentColor(c);
                          setIsRainbow(false);
                          setIsGalaxy(false);
                          setShowColorPicker(false);
                        }}
                        className={`w-6 h-6 rounded-full border border-neutral-600 hover:scale-110 transition ${
                          currentColor === c ? "ring-2 ring-purple-400" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thickness Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThicknessPicker(!showThicknessPicker)}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-[#343434] text-[10px] w-12 h-11 transition"
                  title="Stroke Thickness"
                >
                  <Sliders className="w-4 h-4 text-neutral-300" />
                  <span className="flex items-center gap-0.5 mt-0.5">
                    {currentWidth}px <ChevronDown className="w-2.5 h-2.5" />
                  </span>
                </button>

                {showThicknessPicker && (
                  <div className="absolute top-12 left-0 z-50 p-2 bg-[#252525] border border-[#3e3e3e] rounded-lg shadow-2xl flex flex-col gap-1 w-32">
                    {thicknessOptions.map((th) => (
                      <button
                        key={th}
                        onClick={() => {
                          setCurrentWidth(th);
                          setShowThicknessPicker(false);
                        }}
                        className={`flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-[#343434] ${
                          currentWidth === th ? "text-purple-400 font-bold bg-[#303030]" : "text-neutral-300"
                        }`}
                      >
                        <span>{th}px</span>
                        <div
                          className="rounded-full bg-neutral-200"
                          style={{ width: Math.min(24, th * 2), height: Math.min(10, th) }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Eraser Tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#3a3a3a]">
              <button
                onClick={() => setActiveTool("stroke-eraser")}
                className={`p-1.5 rounded flex flex-col items-center justify-center text-[10px] w-14 h-11 transition ${
                  activeTool === "stroke-eraser"
                    ? "bg-[#3e3e3e] text-purple-400 font-semibold ring-1 ring-purple-400"
                    : "hover:bg-[#343434] text-neutral-300"
                }`}
                title="Stroke Eraser: Erases entire stroke in one touch like OneNote"
              >
                <Eraser className="w-4 h-4" />
                <span>Stroke</span>
              </button>
              <button
                onClick={() => onClearPageInk()}
                className="p-1.5 rounded flex flex-col items-center justify-center text-[10px] w-14 h-11 hover:bg-[#343434] text-rose-400 transition"
                title="Clear All Ink On Active Page"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Ink</span>
              </button>
            </div>

            {/* Hardware Writing Pad & Stylus Settings */}
            <div className="flex items-center gap-2 pl-1">
              {/* Pressure sensitivity toggle */}
              <button
                onClick={() => setPressureSensitivity(!pressureSensitivity)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition border ${
                  pressureSensitivity
                    ? "bg-[#332244] border-purple-500 text-purple-300 font-medium"
                    : "bg-[#252525] border-[#383838] text-neutral-400 hover:text-neutral-200"
                }`}
                title="Stylus Pressure Sensitivity (Wacom / Huion / Surface / Apple Pencil)"
              >
                <span>🖋️</span>
                <span className="hidden lg:inline">Pressure:</span>
                <span className="font-semibold">{pressureSensitivity ? "ON" : "OFF"}</span>
              </button>

              {/* Palm Rejection mode toggle */}
              <button
                onClick={() => setPalmRejection(!palmRejection)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition border ${
                  palmRejection
                    ? "bg-[#183626] border-emerald-500 text-emerald-300 font-medium"
                    : "bg-[#252525] border-[#383838] text-neutral-400 hover:text-neutral-200"
                }`}
                title="Palm Rejection: Inks only with stylus/pen and ignores resting hand touches"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Palm Reject:</span>
                <span className="font-semibold">{palmRejection ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>
        )}

        {/* === INSERT TAB (Add Blank Sheet / Upload PDF) === */}
        {activeTab === "insert" && (
          <div className="flex items-center gap-3">
            <button
              onClick={onUploadPdfClick}
              className="flex items-center gap-2 px-3 py-2 rounded bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 text-xs font-semibold shadow transition"
              title="Upload PDF document to annotate and insert sheets"
            >
              <Upload className="w-4 h-4 text-purple-300" />
              <span>Upload PDF Document</span>
            </button>

            <div className="h-7 w-px bg-[#3e3e3e]" />

            {/* Quick Add Blank A4 Sheets */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddBlankA4Page("plain")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#3d3d3d] text-white text-xs font-medium border border-[#444444] transition"
                title="Insert plain white/dark A4 blank sheet"
              >
                <FilePlus2 className="w-4 h-4 text-emerald-400" />
                <span>+ Blank A4 Sheet</span>
              </button>
              <button
                onClick={() => onAddBlankA4Page("ruled")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#3d3d3d] text-white text-xs font-medium border border-[#444444] transition"
                title="Insert lined notebook A4 sheet"
              >
                <AlignLeft className="w-4 h-4 text-sky-400" />
                <span>+ Ruled A4 Sheet</span>
              </button>
              <button
                onClick={() => onAddBlankA4Page("grid")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#3d3d3d] text-white text-xs font-medium border border-[#444444] transition"
                title="Insert maths graph A4 sheet"
              >
                <Grid3X3 className="w-4 h-4 text-amber-400" />
                <span>+ Grid A4 Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* === VIEW TAB (Rule Lines, Paper Colors, Zoom) === */}
        {activeTab === "view" && (
          <div className="flex items-center gap-4 text-xs">
            {/* Rule Lines */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-[#3a3a3a]">
              <span className="text-neutral-400 font-medium">Rule Lines:</span>
              {(["plain", "ruled", "grid", "dots"] as PaperStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setPaperStyle(style)}
                  className={`px-2.5 py-1 rounded capitalize transition ${
                    paperStyle === style
                      ? "bg-purple-600 text-white font-semibold"
                      : "bg-[#333333] text-neutral-300 hover:bg-[#3c3c3c]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Paper Color */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-[#3a3a3a]">
              <span className="text-neutral-400 font-medium">Paper Color:</span>
              {[
                { id: "dark", label: "Dark", bg: "#191919" },
                { id: "white", label: "White", bg: "#ffffff" },
                { id: "sepia", label: "Sepia", bg: "#faf5e8" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPaperColor(c.id as PaperColor)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition ${
                    paperColor === c.id
                      ? "border-purple-400 text-purple-300 font-semibold bg-[#352545]"
                      : "border-[#404040] text-neutral-300 hover:bg-[#343434]"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full border border-neutral-500" style={{ backgroundColor: c.bg }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <span className="text-neutral-400 font-medium">Zoom:</span>
              <button
                onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
                className="w-6 h-6 rounded bg-[#333333] hover:bg-[#3e3e3e] flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold text-neutral-200">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
                className="w-6 h-6 rounded bg-[#333333] hover:bg-[#3e3e3e] flex items-center justify-center font-bold"
              >
                +
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="px-2 py-1 rounded bg-[#333333] hover:bg-[#3e3e3e] text-[11px]"
              >
                100%
              </button>
            </div>
          </div>
        )}

        {/* === FILE TAB (Export PDF, Save) === */}
        {activeTab === "file" && (
          <div className="flex items-center gap-3">
            <button
              onClick={onExportPdf}
              className="flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Complete PDF (With Notes & Blank Pages)</span>
            </button>
            <button
              onClick={onUploadPdfClick}
              className="flex items-center gap-2 px-3 py-2 rounded bg-[#333333] hover:bg-[#3c3c3c] text-neutral-200 text-xs font-medium border border-[#444444] transition"
            >
              <Upload className="w-4 h-4" />
              <span>Open Another PDF</span>
            </button>
          </div>
        )}

        {/* === HOME TAB === */}
        {activeTab === "home" && (
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2 px-2 py-1 bg-[#232323] rounded border border-[#383838]">
              <span className="font-serif font-bold text-sm px-2">Calibri</span>
              <span className="px-2 border-l border-[#383838]">20</span>
            </div>
            <div className="flex items-center gap-1 font-bold">
              <button className="w-7 h-7 rounded hover:bg-[#383838] flex items-center justify-center">B</button>
              <button className="w-7 h-7 rounded hover:bg-[#383838] flex items-center justify-center italic">I</button>
              <button className="w-7 h-7 rounded hover:bg-[#383838] flex items-center justify-center underline">U</button>
            </div>
            <div className="h-6 w-px bg-[#3e3e3e]" />
            <button
              onClick={() => setActiveTab("draw")}
              className="px-3 py-1.5 rounded bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600/40 font-medium"
            >
              Switch to Draw & Writing Pad Ribbon →
            </button>
          </div>
        )}

        {/* === HELP TAB === */}
        {activeTab === "help" && (
          <div className="flex items-center gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-purple-400">Stylus Support:</span>
              <span>Wacom, Huion, Apple Pencil, XP-Pen, Surface Pen with Pressure</span>
            </div>
            <div className="h-6 w-px bg-[#3e3e3e]" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-purple-400">Shortcuts:</span>
              <span>Ctrl+Z (Undo) • Ctrl+Y (Redo) • E (Eraser) • P (Pen) • H (Highlighter)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
