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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<Point[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);

  // Redraw all committed strokes
  const redrawAllStrokes = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, width, height);

      for (const stroke of strokes) {
        if (!stroke.points || stroke.points.length === 0) continue;

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

        if (stroke.points.length === 1) {
          ctx.fillStyle = stroke.color;
          ctx.beginPath();
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        ctx.strokeStyle = stroke.color;

        for (let i = 0; i < stroke.points.length - 1; i++) {
          const p1 = stroke.points[i];
          const p2 = stroke.points[i + 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          const pressure = pressureSensitivity ? (p2.pressure ?? 0.5) : 0.5;
          ctx.lineWidth = Math.max(1, stroke.width * (0.35 + pressure * 1.3));

          if (stroke.isRainbow) {
            ctx.strokeStyle = `hsl(${(i * 12) % 360}, 100%, 60%)`;
          } else if (stroke.isGalaxy) {
            ctx.strokeStyle = i % 2 === 0 ? "#a855f7" : "#06b6d4";
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          ctx.stroke();
        }

        ctx.restore();
      }
    },
    [strokes, width, height, pressureSensitivity]
  );

  // Sync canvas dimensions and redraw when strokes update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    redrawAllStrokes(ctx);
  }, [strokes, redrawAllStrokes]);

  // Check if a point hits any existing stroke to erase it
  const checkStrokeErasure = (point: Point) => {
    const eraserRadius = 16 / scale;

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

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return { x, y, pressure };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm Rejection: If user selected pen-only and event is touch, ignore drawing!
    if (palmRejection && e.pointerType === "touch") {
      return;
    }

    if (activeTool === "select" || activeTool === "pan") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const pt = getCanvasCoordinates(e);

    if (activeTool === "stroke-eraser" || activeTool === "precision-eraser") {
      setIsDrawing(true);
      checkStrokeErasure(pt);
      return;
    }

    setIsDrawing(true);
    currentPointsRef.current = [pt];

    activeStrokeRef.current = {
      id: "stroke_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      tool: activeTool === "highlighter" ? "highlighter" : "pen",
      color: currentColor,
      width: currentWidth,
      isHighlighter,
      isRainbow,
      isGalaxy,
      points: [pt],
    };

    // Draw initial point on canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (isHighlighter) {
        ctx.globalAlpha = 0.45;
        ctx.globalCompositeOperation = "multiply";
      }
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (currentWidth * (pressureSensitivity ? pt.pressure : 0.5)) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (palmRejection && e.pointerType === "touch") return;

    const pt = getCanvasCoordinates(e);

    if (activeTool === "stroke-eraser" || activeTool === "precision-eraser") {
      checkStrokeErasure(pt);
      return;
    }

    const points = currentPointsRef.current;
    points.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (points.length >= 2) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isHighlighter) {
        ctx.globalAlpha = 0.45;
        ctx.globalCompositeOperation = "multiply";
      } else {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
      }

      const pressure = pressureSensitivity ? pt.pressure : 0.5;
      ctx.lineWidth = Math.max(1, currentWidth * (0.35 + pressure * 1.3));

      if (isRainbow) {
        ctx.strokeStyle = `hsl(${(points.length * 12) % 360}, 100%, 60%)`;
      } else if (isGalaxy) {
        ctx.strokeStyle = points.length % 2 === 0 ? "#a855f7" : "#06b6d4";
      } else {
        ctx.strokeStyle = currentColor;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if pointer capture already released
    }

    if (activeTool === "stroke-eraser" || activeTool === "precision-eraser") {
      return;
    }

    if (activeStrokeRef.current && currentPointsRef.current.length > 0) {
      activeStrokeRef.current.points = [...currentPointsRef.current];
      onStrokeComplete(activeStrokeRef.current);
      activeStrokeRef.current = null;
      currentPointsRef.current = [];
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`drawing-layer absolute inset-0 z-20 ${
        activeTool === "pan"
          ? "cursor-grab"
          : activeTool === "stroke-eraser" || activeTool === "precision-eraser"
          ? "cursor-crosshair"
          : "cursor-crosshair"
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
    />
  );
};
