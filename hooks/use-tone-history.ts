"use client";

import { useState, useCallback } from "react";

export function useToneHistory(initialValue: string) {
  const [originalText, setOriginalTextState] = useState(initialValue);
  const [currentText, setCurrentText] = useState(initialValue);

  const setOriginalText = useCallback((text: string) => {
    setOriginalTextState(text);
    setCurrentText(text);
  }, []);

  const applyAiTransform = useCallback((aiText: string) => {
    setCurrentText(aiText);
  }, []);

  const clear = useCallback(() => {
    setOriginalTextState("");
    setCurrentText("");
  }, []);

  return {
    currentText,
    originalText,
    setOriginalText,
    applyAiTransform,
    clear,
  };
}
