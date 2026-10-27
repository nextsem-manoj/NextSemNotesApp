import React, { useState } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Sparkles,
  Smartphone,
  Ruler,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { ActiveToolType, PenPreset } from "../types";

interface FloatingPenDockProps {
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
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const FloatingPenDock: React.FC<FloatingPenDockProps> = ({
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
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickPens: PenPreset[] = [
    { id: "pen-white", name: "White / Crisp Pen", color: "#ffffff", width: 2.0 },
    { id: "pen-blue", name: "Sky Blue", color: "#38bdf8", width: 2.0 },
    { id: "pen-red", name: "Coral Red", color: "#f87171", width: 2.0 },
    { id: "pen-green", name: "Lime Green", color: "#4ade80", width: 2.0 },
    { id: "pen-rainbow", name: "Rainbow Pen", color: "#ec4899", width: 3.0, isRainbow: true },
    { id: "pen-galaxy", name: "Galaxy Ink", color: "#8b5cf6", width: 3.5, isGalaxy: true },
    { id: "hl-yellow", name: "Yellow Highlighter", color: "#facc15", width: 14.0, isHighlighter: true },
  ];

  const handleSelectQuickPen = (pen: PenPreset) => {
    setCurrentColor(pen.color);
    setCurrentWidth(pen.width);
    setIsHighlighter(Boolean(pen.isHighlighter));
    setIsRainbow(Boolean(pen.isRainbow));
    setIsGalaxy(Boolean(pen.isGalaxy));
    setActiveTool(pen.isHighlighter ? "highlighter" : "pen");
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424]/95 hover:bg-[#303030] border border-[#3e3e3e] shadow-2xl text-xs text-purple-300 font-semibold transition"
          title="Open Quick Pen Dock"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Quick Pens</span>
          <ChevronUp className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1e1e1e]/95 backdrop-blur-md border border-[#363636] shadow-2xl select-none text-xs text-neutral-300">
      {/* 1. Undo & Redo Quick Buttons */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#333]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg hover:bg-[#2e2e2e] transition ${
            !canUndo ? "opacity-30 cursor-not-allowed" : "text-white hover:text-purple-300"
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg hover:bg-[#2e2e2e] transition ${
            !canRedo ? "opacity-30 cursor-not-allowed" : "text-white hover:text-purple-300"
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Quick Pen Shelf */}
      <div className="flex items-center gap-1 px-1">
        {quickPens.map((pen) => {
          const isSelected =
            ((!isHighlighter && !pen.isHighlighter && activeTool === "pen") ||
              (isHighlighter && pen.isHighlighter && activeTool === "highlighter")) &&
            (pen.isRainbow ? isRainbow : pen.isGalaxy ? isGalaxy : currentColor === pen.color);

          return (
            <button
              key={pen.id}
              onClick={() => handleSelectQuickPen(pen)}
              className={`relative p-1.5 rounded-xl transition flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-[#333333] ring-1 ring-purple-400 scale-105 shadow-md"
                  : "hover:bg-[#2a2a2a]"
              }`}
              title={pen.name}
            >
              {pen.isHighlighter ? (
                <Highlighter className="w-4 h-4" style={{ color: pen.color }} />
              ) : pen.isGalaxy ? (
                <Sparkles className="w-4 h-4 text-purple-400" />
              ) : pen.isRainbow ? (
                <PenTool className="w-4 h-4 text-pink-400" />
              ) : (
                <PenTool className="w-4 h-4" style={{ color: pen.color }} />
              )}
              <div
                className={`w-3.5 h-1 rounded-full mt-0.5 ${
                  pen.isRainbow
                    ? "bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                    : pen.isGalaxy
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                    : ""
                }`}
                style={!pen.isRainbow && !pen.isGalaxy ? { backgroundColor: pen.color } : {}}
              />
            </button>
          );
        })}
      </div>

      {/* 3. Eraser Quick Toggle */}
      <div className="px-1 border-l border-[#333]">
        <button
          onClick={() => setActiveTool("stroke-eraser")}
          className={`p-1.5 rounded-xl transition flex items-center justify-center ${
            activeTool === "stroke-eraser"
              ? "bg-[#382626] text-rose-300 ring-1 ring-rose-500 font-semibold"
              : "hover:bg-[#2a2a2a] text-neutral-300"
          }`}
          title="Stroke Eraser (Instant 1-touch stroke deletion)"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Stroke Thickness Quick Buttons */}
      <div className="flex items-center gap-1 px-1.5 border-l border-[#333]">
        <button
          onClick={() => setCurrentWidth(Math.max(1, currentWidth - 0.5))}
          className="w-5 h-5 rounded hover:bg-[#2e2e2e] flex items-center justify-center font-bold text-neutral-400 hover:text-white"
          title="Decrease pen thickness"
        >
          -
        </button>
        <span className="w-8 text-center font-semibold text-neutral-200 text-[11px]">
          {currentWidth}px
        </span>
        <button
          onClick={() => setCurrentWidth(Math.min(20, currentWidth + 0.5))}
          className="w-5 h-5 rounded hover:bg-[#2e2e2e] flex items-center justify-center font-bold text-neutral-400 hover:text-white"
          title="Increase pen thickness"
        >
          +
        </button>
      </div>

      {/* 5. Draw & Hold Ruler Indicator (Smart Lines) */}
      <div className="pl-1 border-l border-[#333] flex items-center gap-1">
        <span
          className="p-1 rounded text-neutral-400 hover:text-sky-300 cursor-help"
          title="Smart Ruler: Hold pen still at end of stroke for 0.4s to snap to straight line!"
        >
          <Ruler className="w-3.5 h-3.5 text-sky-400" />
        </span>

        {/* Palm Rejection Toggle */}
        <button
          onClick={() => setPalmRejection(!palmRejection)}
          className={`p-1.5 rounded-lg transition ${
            palmRejection ? "text-emerald-400" : "text-neutral-500"
          }`}
          title={
            palmRejection
              ? "Palm Rejection: ON (Inks only with stylus, ignores hand touch)"
              : "Palm Rejection: OFF"
          }
        >
          <Smartphone className="w-3.5 h-3.5" />
        </button>

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded text-neutral-500 hover:text-neutral-300 ml-0.5"
          title="Collapse dock"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
