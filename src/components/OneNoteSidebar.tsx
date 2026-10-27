import React, { useState } from "react";
import {
  Plus,
  AlignLeft,
  Grid3X3,
  FilePlus2,
  Trash2,
  ChevronDown,
  Upload,
  BookOpen,
  Pin,
} from "lucide-react";
import type { PageData, SectionData, PaperStyle } from "../types";

interface OneNoteSidebarProps {
  sections: SectionData[];
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  onAddSection: (name: string, color: string) => void;
  pages: PageData[];
  activePageId: string;
  setActivePageId: (id: string) => void;
  onAddBlankA4Page: (style: PaperStyle, insertAfterPageId?: string) => void;
  onDeletePage: (id: string) => void;
  onUploadPdfClick: () => void;
  notebookTitle: string;
  setNotebookTitle: (title: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const OneNoteSidebar: React.FC<OneNoteSidebarProps> = ({
  sections,
  activeSectionId,
  setActiveSectionId,
  onAddSection,
  pages,
  activePageId,
  setActivePageId,
  onAddBlankA4Page,
  onDeletePage,
  onUploadPdfClick,
  notebookTitle,
  setNotebookTitle: _setNotebookTitle,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedPillColor, setSelectedPillColor] = useState("#22c55e");

  const colors = ["#22c55e", "#0284c7", "#d97706", "#9333ea", "#e11d48", "#14b8a6", "#eab308"];

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    onAddSection(newSectionName.trim(), selectedPillColor);
    setNewSectionName("");
    setIsAddingSection(false);
  };

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col items-center py-3 select-none shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded hover:bg-[#2e2e2e] text-neutral-400 hover:text-white transition"
          title="Expand Sections & Pages Sidebar"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#1b1b1b] border-r border-[#2d2d2d] select-none shrink-0 z-10 text-xs">
      {/* COLUMN 1: SECTIONS LIST (Matching user reference image left pane) */}
      <div className="w-44 bg-[#1b1b1b] border-r border-[#282828] flex flex-col justify-between">
        <div className="flex flex-col overflow-y-auto">
          {/* Notebook Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#282828] text-neutral-300 font-semibold">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#7719aa]" />
              <span className="truncate">{notebookTitle}</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-[#2d2d2d] text-neutral-400"
              title="Collapse sidebar"
            >
              ◂
            </button>
          </div>

          {/* Section Items */}
          <div className="flex flex-col py-1">
            {sections.map((sec) => {
              const isActive = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 transition text-left relative group ${
                    isActive
                      ? "bg-[#282828] text-white font-medium shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-[#222222]"
                  }`}
                >
                  {/* Left Colored Pill (Exactly like OneNote screenshot) */}
                  <span
                    className="w-1.5 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: sec.color || "#22c55e" }}
                  />
                  <span className="truncate flex-1">{sec.name}</span>
                  <span className="text-[10px] text-neutral-500 opacity-60">
                    {sec.pages.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* + New Section Form */}
          {isAddingSection ? (
            <form onSubmit={handleCreateSection} className="p-2 bg-[#252525] border-t border-[#333333]">
              <input
                type="text"
                autoFocus
                placeholder="Section name..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full px-2 py-1 bg-[#1c1c1c] border border-neutral-700 rounded text-xs text-white outline-none mb-1.5"
              />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedPillColor(c)}
                      className={`w-3.5 h-3.5 rounded-full ${selectedPillColor === c ? "ring-2 ring-white" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded bg-purple-600 text-white text-[11px] font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-2 py-0.5 rounded bg-[#333333] text-neutral-400 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-neutral-200 hover:bg-[#222222] transition text-left mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Section</span>
            </button>
          )}
        </div>

        {/* Quick Notes pinned footer */}
        <div className="p-2 border-t border-[#282828] flex items-center gap-1.5 text-neutral-500 text-[11px]">
          <Pin className="w-3 h-3 text-neutral-400" />
          <span>Quick Notes</span>
        </div>
      </div>

      {/* COLUMN 2: PAGES LIST (Matching user reference image middle pane) */}
      <div className="w-48 bg-[#202020] flex flex-col justify-between">
        <div className="flex flex-col overflow-y-auto">
          {/* Top Add Page Button */}
          <div className="p-2 border-b border-[#282828] relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded bg-[#2b2b2b] hover:bg-[#333333] text-neutral-200 font-medium transition border border-[#383838]"
            >
              <div className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>Add Page</span>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Dropdown to add Blank A4, Ruled, Grid or Upload PDF */}
            {showAddMenu && (
              <div className="absolute top-10 left-2 right-2 z-50 p-1.5 bg-[#252525] border border-[#3d3d3d] rounded-lg shadow-xl flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    onAddBlankA4Page("plain");
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#333333] text-left text-neutral-200"
                >
                  <FilePlus2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Blank A4 Sheet</span>
                </button>
                <button
                  onClick={() => {
                    onAddBlankA4Page("ruled");
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#333333] text-left text-neutral-200"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ruled A4 Sheet</span>
                </button>
                <button
                  onClick={() => {
                    onAddBlankA4Page("grid");
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#333333] text-left text-neutral-200"
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Grid A4 Sheet</span>
                </button>
                <div className="h-px bg-[#353535] my-1" />
                <button
                  onClick={() => {
                    onUploadPdfClick();
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#333333] text-left text-purple-300 font-medium"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF Pages</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Pages */}
          <div className="flex flex-col py-1">
            {pages.map((p, idx) => {
              const isActive = p.id === activePageId;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePageId(p.id)}
                  className={`flex items-center justify-between px-3 py-2 border-b border-[#262626] cursor-pointer group transition ${
                    isActive
                      ? "bg-[#2b2b2b] text-white font-medium border-l-2 border-l-purple-500"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-[#252525]"
                  }`}
                >
                  <div className="flex flex-col truncate pr-1">
                    <span className="truncate text-xs font-normal">
                      {p.title || `Page ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-neutral-500 truncate">
                      {p.type === "pdf" ? `PDF Page ${(p.pdfPageIndex ?? 0) + 1}` : `A4 ${p.paperStyle}`}
                    </span>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddBlankA4Page(p.paperStyle || "ruled", p.id);
                      }}
                      className="p-1 rounded hover:bg-[#3a3a3a] text-neutral-300"
                      title="Insert blank A4 sheet after this page"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(p.id);
                        }}
                        className="p-1 rounded hover:bg-[#3a3a3a] text-rose-400"
                        title="Delete page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom pages count info */}
        <div className="p-2 border-t border-[#282828] text-[11px] text-neutral-500 text-center">
          {pages.length} {pages.length === 1 ? "page" : "pages"} in section
        </div>
      </div>
    </div>
  );
};
