"use client";

import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import TextEditor from "@/components/text-editor";
import TonePlayground from "@/components/tone-playground";
import { toast } from "sonner";
import { useToneHistory } from "@/hooks/use-tone-history";
import { useToneApi } from "@/hooks/use-tone-api";
import { PlaygroundPosition, ToneOption } from "@/utils/types";

export default function Home() {
  const toneHistory = useToneHistory("");
  const { transform, isLoading, error, clearError } = useToneApi();
  const [playgroundPosition, setPlaygroundPosition] =
    useState<PlaygroundPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (error) {
      toast.error("Transformation failed", {
        description: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const handleTextChange = useCallback(
    (value: string) => {
      toneHistory.setOriginalText(value);
    },
    [toneHistory]
  );

  const handleSubmit = useCallback(async () => {
    if (!toneHistory.originalText.trim()) return;

    try {
      const defaultTone: ToneOption = { label: "Balanced", prompt: "balanced" };
      const transformed = await transform({
        text: toneHistory.originalText,
        tone: defaultTone,
      });

      toneHistory.applyAiTransform(transformed);
      toast.success("Transformed to balanced tone", {
        description: "Your text has been successfully transformed",
      });
    } catch {
      // no-op
    }
  }, [toneHistory, transform]);

  const handlePlaygroundChange = useCallback(
    async ({ x, y }: PlaygroundPosition) => {
      setPlaygroundPosition({ x, y });

      if (!toneHistory.originalText.trim()) return;

      try {
        // x and y are in -100..100
        const right = Math.max(0, x);
        const left = Math.max(0, -x);
        const top = Math.max(0, y);
        const bottom = Math.max(0, -y);

        const formality = `professional:${Math.round(top)}% casual:${Math.round(
          bottom
        )}%`;
        const emotion = `expanded:${Math.round(right)}% concise:${Math.round(
          left
        )}%`;
        const style = `blend:${Math.min(100, Math.round(Math.hypot(x, y)))}%`;

        const transformed = await transform({
          text: toneHistory.originalText,
          tone: {
            formality,
            emotion,
            style,
          },
        });

        toneHistory.applyAiTransform(transformed);
        toast.success("Tone updated from playground");
      } catch {
        // no-op
      }
    },
    [toneHistory, transform]
  );

  return (
    <main className="h-screen bg-background flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0"
      >
        <div className="flex flex-col border-r border-border border-dashed">
          <TextEditor
            value={toneHistory.currentText}
            onChange={handleTextChange}
            isLoading={isLoading}
            onClear={toneHistory.clear}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex flex-col justify-center h-full p-6 gap-6">
          <TonePlayground
            axisLabels={{
              top: "Professional",
              right: "Expanded",
              bottom: "Casual",
              left: "Concise",
            }}
            value={playgroundPosition}
            onChange={handlePlaygroundChange}
            disabled={isLoading || !toneHistory.originalText.trim()}
          />

          <div
            className={`flex flex-col gap-3 ${
              !toneHistory.originalText.trim() ? "opacity-50" : ""
            }`}
          >
            <label className="text-sm font-medium text-caret uppercase">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-3 py-2 text-xs uppercase border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePlaygroundChange({ x: -70, y: 70 })}
                disabled={isLoading || !toneHistory.originalText.trim()}
              >
                Executive
              </button>
              <button
                className="px-3 py-2 text-xs uppercase border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePlaygroundChange({ x: 70, y: 70 })}
                disabled={isLoading || !toneHistory.originalText.trim()}
              >
                Technical
              </button>
              <button
                className="px-3 py-2 text-xs uppercase border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePlaygroundChange({ x: -70, y: -70 })}
                disabled={isLoading || !toneHistory.originalText.trim()}
              >
                Basic
              </button>
              <button
                className="px-3 py-2 text-xs uppercase border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePlaygroundChange({ x: 70, y: -70 })}
                disabled={isLoading || !toneHistory.originalText.trim()}
              >
                Educational
              </button>
            </div>
            <div>
              <button
                className="mt-2 px-3 py-2 text-xs uppercase border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePlaygroundChange({ x: 0, y: 0 })}
                disabled={isLoading || !toneHistory.originalText.trim()}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
