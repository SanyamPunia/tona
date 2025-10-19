"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AxisLabels, PlaygroundPosition } from "@/utils/types";

interface TonePlaygroundProps {
  axisLabels: AxisLabels;
  onChange: (coords: PlaygroundPosition) => void;
  disabled?: boolean;
  value?: PlaygroundPosition;
}

export default function TonePlayground({
  axisLabels,
  onChange,
  disabled,
  value,
}: TonePlaygroundProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PlaygroundPosition>({
    x: 0,
    y: 0,
  });
  const [areaSize, setAreaSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  useEffect(() => {
    const measure = () => {
      const rect = areaRef.current?.getBoundingClientRect();
      if (rect) setAreaSize({ w: rect.width, h: rect.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    onChange(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value)
      setPosition({
        x: Math.max(-100, Math.min(100, value.x)),
        y: Math.max(-100, Math.min(100, value.y)),
      });
  }, [value]);

  function computeNormalized(point: PlaygroundPosition): PlaygroundPosition {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // clamp to bounds
    const clampedX = Math.max(-centerX, Math.min(centerX, point.x));
    const clampedY = Math.max(-centerY, Math.min(centerY, point.y));

    // normalize to -100..100
    const normX = Math.round((clampedX / centerX) * 100);
    const normY = Math.round(((clampedY * -1) / centerY) * 100);
    return { x: normX, y: normY };
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-caret uppercase">
          Tone Playground
        </label>
        <div className="text-xs text-zinc-400 font-mono">
          x: <span className="text-zinc-200">{position.x}</span>, y:{" "}
          <span className="text-zinc-200">{position.y}</span>
        </div>
      </div>

      <div
        ref={areaRef}
        className={`relative w-full h-[360px] border border-border rounded-sm bg-background/60 select-none ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* axis */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-border/60" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-border/60" />

        {/* highlight active quadrant */}
        <div
          className={`absolute left-1/2 top-2 -translate-x-1/2 text-[10px] uppercase ${
            position.y > 0 ? "text-zinc-200" : "text-zinc-500"
          }`}
        >
          {axisLabels.top}
        </div>
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase ${
            position.x > 0 ? "text-zinc-200" : "text-zinc-500"
          }`}
        >
          {axisLabels.right}
        </div>
        <div
          className={`absolute left-1/2 bottom-2 -translate-x-1/2 text-[10px] uppercase ${
            position.y < 0 ? "text-zinc-200" : "text-zinc-500"
          }`}
        >
          {axisLabels.bottom}
        </div>
        <div
          className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase ${
            position.x < 0 ? "text-zinc-200" : "text-zinc-500"
          }`}
        >
          {axisLabels.left}
        </div>

        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.12}
          dragConstraints={areaRef}
          whileTap={{ scale: 0.99 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          animate={{
            x: (position.x / 100) * (areaSize.w / 2),
            y: (-position.y / 100) * (areaSize.h / 2),
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          onDrag={(_, info) => {
            const rect = areaRef.current?.getBoundingClientRect();
            if (!rect) return;
            // position relative to center in px
            const relX = info.point.x - (rect.left + rect.width / 2);
            const relY = info.point.y - (rect.top + rect.height / 2);
            const normalized = computeNormalized({ x: relX, y: relY });
            setPosition(normalized);
          }}
          onDragEnd={() => {
            onChange(position);
          }}
        >
          <div className="grid place-items-center size-8 rounded-full border border-border bg-zinc-900 text-[10px] text-zinc-300">
            <div className="size-1.5 rounded-full bg-caret" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
