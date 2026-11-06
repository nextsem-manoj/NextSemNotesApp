# NextSemNotesApp (OneNote PDF Studio)

> A modern web notes portal inspired by **Microsoft OneNote (Windows 11 Dark Theme)** where students and educators can upload any PDF document, seamlessly insert blank/ruled/grid A4 sheets anywhere inside it, and write with digital writing pads and styluses.

![OneNote PDF Studio UI](https://img.shields.io/badge/UI-Microsoft%20OneNote%20Dark%20Theme-7719aa)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Framework](https://img.shields.io/badge/Stack-React%2019%20%2B%20Vite%20%2B%20TypeScript%20%2B%20Tailwind%20v4-blue)

---

## ✨ Features

### 1. 🪟 Microsoft OneNote Look & Feel
- **Windows 11 Dark Theme Ribbon**: File, Home, Insert, Draw, and View tabs with OneNote purple branding (`#7719aa`).
- **Two-Column Navigation Sidebar**:
  - **Left Section Pane**: Subject/Chapter sections with vertical colored status pills (matching OneNote notebooks like *8th, BCA-2026, phy 12th, Maths 11th*, etc.).
  - **Middle Pages Pane**: Quick page thumbnails, active selection highlights, drag/reorder indicators, and *+ Add Page* button.
- **Page Header**: Editable title line with automated date-time stamp (`27 October 2026 17:19`) separated by an authentic OneNote horizontal divider line.

### 2. 📄 PDF Upload & Dynamic A4 Sheet Insertion
- **Upload Any PDF**: Renders multi-page PDF documents with high-DPI crystal clarity using `pdfjs-dist`.
- **Insert A4 Blank Sheets Anywhere**:
  - Insert at the end of the document or right between existing PDF pages.
  - Choose between **Blank A4**, **Ruled A4** (college lined notebook paper with red margin line), or **Grid A4** (maths graph paper).
  - Adjust paper themes: Dark Notebook, Classic White, or Warm Sepia/Cream.

### 3. 🖊️ Digital Writing Pad & Stylus Engine
- **Writing Pad Hardware Compatibility**: Built for Wacom, Huion, Apple Pencil, Surface Pen, XP-Pen, Gaomon, or touch/mouse input.
- **Pressure Sensitivity**: Variable stroke thickness that naturally swells and tapers with stylus pen pressure (`PointerEvent.pressure`).
- **Smooth Bezier Ink**: Quadratic spline interpolation eliminating jitter and producing natural handwriting.
- **OneNote Signature Pen Rack**:
  - Ballpoint Pens (0.5mm, 1mm, 2mm, customizable colors).
  - Highlighters (Semi-transparent multiply blending, Yellow, Mint, Pink, Cyan).
  - Rainbow & Galaxy Shimmer Inks.
- **Stroke Eraser**: Deletes the whole continuous stroke in a single touch (just like OneNote).
- **Palm Rejection**: Stylus-only mode ignores accidental resting palm touches while writing.
- **Vector Undo / Redo**: Instant `Ctrl+Z` and `Ctrl+Y` support.

### 4. 💾 High-Resolution PDF Export
- Exports the combined document using `pdf-lib`.
- Burns all handwritten annotations, drawings, and newly inserted A4 blank/ruled pages directly into a standard, shareable `.pdf` file.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### Installation

```bash
# Clone or navigate to the repository
cd "C:\Users\Manoj\nextsemorg\onenote-pdf-portal"

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` | Undo last stroke |
| `Ctrl + Y` | Redo stroke |
| `P` | Switch to Pen tool |
| `H` | Switch to Highlighter |
| `E` | Switch to Stroke Eraser |
| `Ctrl + F` | Search notes & pages |

---

## 🛠️ Project Structure

```
onenote-pdf-portal/
├── src/
│   ├── components/
│   │   ├── DrawingCanvas.tsx       # Pressure-sensitive stylus & writing engine
│   │   ├── OneNoteRibbon.tsx        # Fluent ribbon bar & pen rack
│   │   ├── OneNoteSidebar.tsx       # Sections & pages two-column navigation
│   │   └── OneNoteWorkspace.tsx     # Central A4 sheet workspace & page headers
│   ├── utils/
│   │   └── pdfEngine.ts             # PDF loader (pdfjs-dist) & exporter (pdf-lib)
│   ├── types.ts                     # TypeScript data interfaces
│   ├── index.css                    # OneNote paper patterns (ruled, grid, sepia)
│   ├── App.tsx                      # Main application state & orchestration
│   └── main.tsx                     # React root mount
├── package.json
└── vite.config.ts
```

---

## 📝 License
MIT License. Created for Nextsem Academy by Er. Manoj Kumar.
