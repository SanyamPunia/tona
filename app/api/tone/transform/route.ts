import { type NextRequest, NextResponse } from "next/server";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

function getCacheKey(text: string, tone: string): string {
  return `${text}:${tone}`;
}

function getFromCache(key: string): string | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setCache(key: string, data: string): void {
  if (cache.size >= 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey as string);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  if (!MISTRAL_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "API key not configured", code: "MISSING_KEY" },
      },
      { status: 500 }
    );
  }

  try {
    const { text, tone } = await request.json();

    if (!text || !tone) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Missing text or tone", code: "INVALID_INPUT" },
        },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Text must be a non-empty string",
            code: "INVALID_INPUT",
          },
        },
        { status: 400 }
      );
    }

    if (text.trim().length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Text exceeds maximum length of 5000 characters",
            code: "TEXT_TOO_LONG",
          },
        },
        { status: 400 }
      );
    }

    const toneKey = `${tone.formality}:${tone.emotion}:${tone.style}`;
    const cacheKey = getCacheKey(text, toneKey);
    const cached = getFromCache(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: { transformedText: cached, cached: true },
      });
    }

    const prompt = `You are a professional text transformation assistant. Your task is to rephrase the given text according to specific tone parameters.

TONE PARAMETERS:
- Formality: ${tone.formality}
- Emotional tone: ${tone.emotion}
- Style: ${tone.style}

ORIGINAL TEXT:
${text}

STRICT RULES:
1. Return ONLY the rephrased text as a plain paragraph
2. Do NOT include any explanations, commentary, or notes
3. Do NOT add quotes, markdown formatting, or special characters
4. Do NOT start with phrases like "Here is..." or "The transformed text is..."
5. If the input is nonsensical, gibberish, or inappropriate, respond with: "Unable to rephrase: Invalid or inappropriate content provided."
6. Preserve the core meaning while adapting the tone
7. Keep the response concise and natural

OUTPUT (plain text only):`;

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorData.message || "Mistral API error",
            code: "API_ERROR",
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const transformedText = data.choices[0].message.content.trim();

    setCache(cacheKey, transformedText);

    return NextResponse.json({
      success: true,
      data: { transformedText, cached: false },
    });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
          code: "SERVER_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
