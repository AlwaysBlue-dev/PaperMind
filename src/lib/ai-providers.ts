import { createHash } from "crypto";

export type AIProvider = "gemini" | "groq" | "openrouter" | "static";

export type AIResponse = {
  text: string;
  provider: AIProvider;
  cached: boolean;
};

type CacheEntry = {
  text: string;
  provider: AIProvider;
  expires: number;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function hashPrompt(prompt: string, context?: string): string {
  return createHash("sha256")
    .update(`${context ?? ""}::${prompt}`)
    .digest("hex");
}

function getCached(key: string): AIResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return { text: entry.text, provider: entry.provider, cached: true };
}

function setCache(key: string, text: string, provider: AIProvider) {
  cache.set(key, {
    text,
    provider,
    expires: Date.now() + CACHE_TTL_MS,
  });
}

function buildUserMessage(prompt: string, context?: string): string {
  return context ? `${context}\n\n${prompt}` : prompt;
}

async function callGemini(message: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callGroq(message: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: message }],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callOpenRouter(message: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "PaperMind",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: "user", content: message }],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

const STATIC_FALLBACK =
  "A detailed model answer is temporarily unavailable. Please try again in a few minutes.";

export async function generateAIResponse(
  prompt: string,
  context?: string
): Promise<AIResponse> {
  const key = hashPrompt(prompt, context);
  const hit = getCached(key);
  if (hit) return hit;

  const message = buildUserMessage(prompt, context);

  const providers: { name: AIProvider; call: () => Promise<string | null> }[] = [
    { name: "gemini", call: () => callGemini(message) },
    { name: "groq", call: () => callGroq(message) },
    { name: "openrouter", call: () => callOpenRouter(message) },
  ];

  for (const { name, call } of providers) {
    try {
      const text = await call();
      if (text?.trim()) {
        setCache(key, text.trim(), name);
        return { text: text.trim(), provider: name, cached: false };
      }
    } catch {
      // try next provider
    }
  }

  setCache(key, STATIC_FALLBACK, "static");
  return { text: STATIC_FALLBACK, provider: "static", cached: false };
}
