"use client";

import { useMutation } from "@tanstack/react-query";
import { ToneOption, WeightedTone } from "@/utils/types";

interface TransformParams {
  text: string;
  tone: ToneOption | WeightedTone;
}

async function transformText({ text, tone }: TransformParams): Promise<string> {
  const response = await fetch("/api/tone/transform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      tone:
        "prompt" in tone
          ? {
              formality: tone.prompt,
              emotion: tone.prompt,
              style: tone.prompt,
            }
          : tone,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to transform text");
  }

  const data = await response.json();

  if (data.success) {
    return data.data.transformedText;
  } else {
    throw new Error(data.error?.message || "An error occurred");
  }
}

export function useToneApi() {
  const mutation = useMutation({
    mutationFn: transformText,
  });

  return {
    transform: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    clearError: mutation.reset,
  };
}
