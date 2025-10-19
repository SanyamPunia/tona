"use client";

import { SAMPLE_TEXTS } from "@/utils/lib";
import { motion, AnimatePresence } from "framer-motion";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onClear: () => void;
  onSubmit?: () => void;
}

export default function TextEditor({
  value,
  onChange,
  isLoading,
  onClear,
  onSubmit,
}: TextEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      if (onSubmit && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-3 justify-center">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-caret uppercase">
          Original Text
        </label>
        <button
          onClick={onClear}
          disabled={isLoading || !value}
          className="uppercase text-xs px-3 py-1.5 border border-border hover:border-zinc-800 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Enter your text here..."
          className="w-full h-[400px] uppercase p-3 text-sm border border-border bg-background text-zinc-200 placeholder:text-muted-foreground focus:outline-none focus:ring-0 transition-all focus:ring-border disabled:opacity-50 resize-none caret-caret"
        />

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-[2px] border border-border flex flex-col  p-6 space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="animate-spin h-4 w-4 text-caret"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-xs text-zinc-400 uppercase">
                  Transforming...
                </span>
              </div>
              <div className="space-y-2.5">
                {[95, 85, 90, 70, 88, 92].map((width, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="h-3 bg-zinc-800 rounded-sm skeleton-shimmer"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-3.5 right-2 flex items-center gap-1.5 font-mono bg-zinc-900/50 text-zinc-400 w-fit px-2 select-none">
          <span className="text-[10px] uppercase">shift</span>
          <span className="text-xs">+</span>
          <span className="text-lg mb-1">↵</span>
          <span className="text-[10px]">(balanced tone)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {SAMPLE_TEXTS.map((sample, index) => (
          <button
            key={index}
            onClick={() => onChange(sample)}
            disabled={isLoading}
            className="px-3 py-1.5 uppercase text-xs border border-border hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
