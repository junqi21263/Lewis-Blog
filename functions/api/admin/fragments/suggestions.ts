import { jsonResponse, readJsonObject, requireAccess, withErrorHandling } from "../../../_lib/api";

type SuggestionType = "camera" | "mood";
type TranslationEnv = Env & { DEEPSEEK_API_KEY?: string };

const fragmentDeviceSuggestions = [
  "牛马专用 MacBook 🐮",
  "牛马专用相机 📷",
  "正在疯狂工作的电脑 💻",
  "今天也没关机的 MacBook 💻",
  "被生活压榨的键盘 ⌨️",
] as const;

const fragmentMoodSuggestions = [
  "想下班😭",
  "郁闷😒",
  "肚子饿了😫",
  "烦躁😡",
  "有点累但还活着🙂",
  "今天也在硬撑🥲",
  "想躺平🫠",
] as const;

function fallbackSuggestion(type: SuggestionType, current: string) {
  const values = type === "camera" ? fragmentDeviceSuggestions : fragmentMoodSuggestions;
  const candidates = values.filter((value) => value !== current);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? values[0];
}

function cleanSuggestion(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/^["'“”]+|["'“”]+$/g, "").replace(/\s+/g, " ").trim().slice(0, 48);
}

async function generateSuggestion(env: TranslationEnv, type: SuggestionType, current: string) {
  if (!env.DEEPSEEK_API_KEY) {
    return {
      value: fallbackSuggestion(type, current),
      source: "fallback",
      warning: "DEEPSEEK_API_KEY is not configured; a local fragment suggestion was used.",
    };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        response_format: { type: "json_object" },
        temperature: 1.1,
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content:
              "Generate one short, safe Simplified Chinese photography-diary phrase with one fitting emoji. Casual office-worker frustration is welcome, but no motivational language, insults, obscenity, politics, hate, sexual content, or attacks. Return only JSON: {\"suggestion\":\"...\"}.",
          },
          {
            role: "user",
            content: type === "camera"
              ? `Generate a playful device phrase, under 22 Chinese characters. Avoid repeating: ${current || "none"}.`
              : `Generate a casual mood phrase, under 18 Chinese characters. Avoid repeating: ${current || "none"}.`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`DeepSeek returned ${response.status}.`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/gi, "")) as { suggestion?: unknown };
    const value = cleanSuggestion(parsed.suggestion);
    if (!value) throw new Error("DeepSeek returned an empty suggestion.");
    return { value, source: "ai", warning: "" };
  } catch (error) {
    return {
      value: fallbackSuggestion(type, current),
      source: "fallback",
      warning: `DeepSeek suggestion failed; a local fallback was used. ${error instanceof Error ? error.message : ""}`.trim(),
    };
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const body = await readJsonObject(context.request);
    const type: SuggestionType = body.type === "mood" ? "mood" : "camera";
    const current = typeof body.current === "string" ? body.current.trim() : "";
    return jsonResponse({ data: await generateSuggestion(context.env as TranslationEnv, type, current) });
  });
