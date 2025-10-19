"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "tona-text";

function getStoredText(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveText(text: string): void {
  if (typeof window === "undefined") return;
  try {
    if (text.trim()) {
      localStorage.setItem(STORAGE_KEY, text);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // no-op
  }
}

export function useToneHistory(initialValue: string) {
  const [originalText, setOriginalTextState] = useState(initialValue);
  const [currentText, setCurrentText] = useState(initialValue);

  // load from ls on mount
  useEffect(() => {
    const stored = getStoredText();
    if (stored) {
      setOriginalTextState(stored);
      setCurrentText(stored);
    }
  }, []);

  const setOriginalText = useCallback((text: string) => {
    setOriginalTextState(text);
    setCurrentText(text);
    saveText(text);
  }, []);

  const applyAiTransform = useCallback((aiText: string) => {
    setCurrentText(aiText);
  }, []);

  const clear = useCallback(() => {
    setOriginalTextState("");
    setCurrentText("");
    saveText("");
  }, []);

  return {
    currentText,
    originalText,
    setOriginalText,
    applyAiTransform,
    clear,
  };
}
