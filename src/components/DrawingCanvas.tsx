import React, { useRef, useEffect, useState, useCallback } from "react";
import type { Stroke, Point, ActiveToolType } from "../types";

interface DrawingCanvasProps {
  width: number;
  height: number;
  strokes: Stroke[];
  activeTool: ActiveToolType;
  currentColor: string;
  currentWidth: number;
  isHighlighter?: boolean;
  isRainbow?: boolean;
  isGalaxy?: boolean;
  palmRejection: boolean;
  pressureSensitivity: boolean;
  onStrokeComplete: (stroke: Stroke) => void;
  onStrokeErase: (strokeId: string) => void;
  scale: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  strokes,
  activeTool,
  currentColor,
  currentWidth,
  isHighlighter = false,
  isRainbow = false,
  isGalaxy = false,
  palmRejection,
  pressureSensitivity,
  onStrokeComplete,
  onStrokeErase,
  scale,
}) => {
  // Base canvas holds all committed strokes
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Active canvas handles instantaneous drawing of current stroke without redrawing past strokes
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<Point[]>([]);
  const isStraightLineRef = useRef<boolean>(false);
  const holdTimerRef = useRef<number | null>(null);
  const isBarrelErasingRef = useRef<boolean>(false);

  // Floating cursor position for exact pen tip & eraser radius indicator
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Render a single stroke with Bezier curves & pressure modulation
  const drawStrokeToContext = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.points || stroke.points.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.isHighlighter) {
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = "multiply";
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
    }

    if (stroke.isStraightLine && stroke.points.length >= 2) {
      // Draw straight snapped ruler line
      const pStart = stroke.points[0];
      const pEnd = stroke.points[stroke.points.length - 1];
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (stroke.points.length === 1) {
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.strokeStyle = stroke.color;

    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const pressure = pressureSensitivity ? (p2.pressure ?? 0.5) : 0.5;
      // Natural pressure taper
      ctx.lineWidth = Math.max(1, stroke.width * (0.35 + pressure * 1.3));

      if (stroke.isRainbow) {
        ctx.strokeStyle = `hsl(${(i * 10) % 360}, 100%, 60%)`;
      } else if (stroke.isGalaxy) {
        ctx.strokeStyle = i % 2 === 0 ? "#a855f7" : "#06b6d4";
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Redraw all committed strokes on the base canvas
  const redrawBaseCanvas = useCallback(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const stroke of strokes) {
      drawStrokeToContext(ctx, stroke);
    }
  }, [strokes, width, height, pressureSensitivity]);

  useEffect(() => {
    redrawBaseCanvas();
  }, [redrawBaseCanvas]);

  // Check if an eraser point touches any stroke to delete it
  const checkStrokeErasure = (point: Point) => {
    const eraserRadius = 18 / scale;

    for (const stroke of strokes) {
      for (const p of stroke.points) {
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < eraserRadius + stroke.width / 2) {
          onStrokeErase(stroke.id);
          return;
        }
      }
    }
  };

  const getCanvasCoordinates = (clientX: number, clientY: number, pressure = 0.5): Point => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (width / rect.width);
    const y = (clientY - rect.top) * (height / rect.height);
    const normalizedPressure = pressure > 0 ? pressure : 0.5;
    return { x, y, pressure: normalizedPressure, time: Date.now() };
  };

  // Clear the active stroke canvas
  const clearActiveCanvas = () => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, width, height);
  };

  // Render the current stroke on activeCanvas
  const renderCurrentActiveStroke = () => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const points = currentPointsRef.current;
    if (points.length === 0) return;

    const currentStroke: Stroke = {
      id: "active",
      tool: activeTool === "highlighter" ? "highlighter" : "pen",
      color: currentColor,
      width: currentWidth,
      isHighlighter,
      isRainbow,
      isGalaxy,
      isStraightLine: isStraightLineRef.current,
      points,
    };

    drawStrokeToContext(ctx, currentStroke);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm Rejection: If user selected pen-only and touch event fires, skip drawing
    if (palmRejection && e.pointerType === "touch") {
      return;
    }

    if (activeTool === "select" || activeTool === "pan") {
      return;
    }

    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    // Hardware Stylus Barrel Button (right click / buttons === 2 or buttons === 32 eraser tip)
    const isBarrelButton = e.buttons === 2 || e.button === 2 || e.buttons === 32;
    if (isBarrelButton) {
      isBarrelErasingRef.current = true;
    } else {
      isBarrelErasingRef.current = false;
    }

    const effectiveEraser =
      isBarrelErasingRef.current ||
      activeTool === "stroke-eraser" ||
      activeTool === "precision-eraser";

    const pt = getCanvasCoordinates(e.clientX, e.clientY, e.pressure);

    if (effectiveEraser) {
      setIsDrawing(true);
      checkStrokeErasure(pt);
      return;
    }

    setIsDrawing(true);
    isStraightLineRef.current = false;
    currentPointsRef.current = [pt];

    renderCurrentActiveStroke();

    // Draw & Hold Timer: Snap to straight line if pen is held stationary at end for 450ms
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      if (currentPointsRef.current.length >= 4) {
        isStraightLineRef.current = true;
        renderCurrentActiveStroke();
      }
    }, 450);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Update floating pen/eraser tip cursor indicator
    setCursorPos({
      x: e.clientX,
      y: e.clientY,
      visible: true,
    });

    if (!isDrawing) return;
    if (palmRejection && e.pointerType === "touch") return;

    const effectiveEraser =
      isBarrelErasingRef.current ||
      activeTool === "stroke-eraser" ||
      activeTool === "precision-eraser";

    // High-frequency coalesced events from stylus tablet (Wacom, Huion, Apple Pencil)
    const coalescedEvents = (e.nativeEvent && (e.nativeEvent as any).getCoalescedEvents)
      ? (e.nativeEvent as any).getCoalescedEvents()
      : [e];

    for (const evt of coalescedEvents) {
      const pt = getCanvasCoordinates(evt.clientX, evt.clientY, evt.pressure);

      if (effectiveEraser) {
        checkStrokeErasure(pt);
      } else {
        currentPointsRef.current.push(pt);
      }
    }

    if (!effectiveEraser) {
      // If user moved significantly after straight snap, reset snap unless held
      if (isStraightLineRef.current && currentPointsRef.current.length > 5) {
        const lastPt = currentPointsRef.current[currentPointsRef.current.length - 1];
        const prevPt = currentPointsRef.current[currentPointsRef.current.length - 3];
        const dist = Math.hypot(lastPt.x - prevPt.x, lastPt.y - prevPt.y);
        if (dist > 15) {
          isStraightLineRef.current = false;
        }
      }

      renderCurrentActiveStroke();

      // Reset draw-and-hold timer on movement
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = window.setTimeout(() => {
        if (currentPointsRef.current.length >= 4) {
          isStraightLineRef.current = true;
          renderCurrentActiveStroke();
        }
      }, 450);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      const canvas = activeCanvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    const effectiveEraser =
      isBarrelErasingRef.current ||
      activeTool === "stroke-eraser" ||
      activeTool === "precision-eraser";

    if (effectiveEraser) {
      isBarrelErasingRef.current = false;
      return;
    }

    if (currentPointsRef.current.length > 0) {
      const finalStroke: Stroke = {
        id: "stroke_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        tool: activeTool === "highlighter" ? "highlighter" : "pen",
        color: currentColor,
        width: currentWidth,
        isHighlighter,
        isRainbow,
        isGalaxy,
        isStraightLine: isStraightLineRef.current,
        points: [...currentPointsRef.current],
      };

      clearActiveCanvas();
      onStrokeComplete(finalStroke);
      currentPointsRef.current = [];
      isStraightLineRef.current = false;
    }
  };

  const handlePointerLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto">
      {/* 1. Base Layer: Holds all completed strokes for zero redraw lag */}
      <canvas
        ref={baseCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* 2. Active Layer: Receives pointer events & renders in-flight stroke at 120Hz */}
      <canvas
        ref={activeCanvasRef}
        width={width}
        height={height}
        className={`drawing-layer absolute inset-0 ${
          activeTool === "pan" ? "cursor-grab" : "cursor-none"
        }`}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: activeTool === "pan" ? "none" : "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()} // Allow stylus barrel button without opening browser context menu
      />

      {/* 3. Floating Interactive Pen & Eraser Tip Cursor */}
      {cursorPos.visible && activeTool !== "pan" && activeTool !== "select" && (
        <div
          className="fixed pointer-events-none z-50 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out shadow-sm"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: `${
              activeTool === "stroke-eraser" || activeTool === "precision-eraser"
                ? 28
                : Math.max(6, currentWidth * scale)
            }px`,
            height: `${
              activeTool === "stroke-eraser" || activeTool === "precision-eraser"
                ? 28
                : Math.max(6, currentWidth * scale)
            }px`,
            border:
              activeTool === "stroke-eraser" || activeTool === "precision-eraser"
                ? "2px dashed #f87171"
                : "1.5px solid rgba(255, 255, 255, 0.8)",
            backgroundColor:
              activeTool === "stroke-eraser" || activeTool === "precision-eraser"
                ? "rgba(239, 68, 68, 0.15)"
                : currentColor,
            opacity: 0.85,
          }}
        />
      )}
    </div>
  );
};
