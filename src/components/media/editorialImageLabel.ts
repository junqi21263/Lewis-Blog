const technicalImagePatterns = [
  /^(?:img|dscf?|pxl|dji|r|l)\s*[-_]?\s*\d{3,}$/i,
  /^_?mg\s*[-_]?\s*\d{3,}$/i,
  /^[a-f0-9]{16,}$/i,
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i,
];

function withoutExtension(value: string) {
  return value.trim().replace(/\.(?:avif|gif|heic|jpe?g|png|webp)$/i, "");
}

export function isTechnicalImageLabel(value: string) {
  const normalized = withoutExtension(value).replace(/\s+/g, " ").trim();
  return !normalized || technicalImagePatterns.some((pattern) => pattern.test(normalized));
}

export function resolveEditorialImageLabel(value: string | null | undefined, fallback: string) {
  const normalized = withoutExtension(value ?? "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return isTechnicalImageLabel(normalized) ? fallback : normalized;
}

export function untitledImageLabel(locale: "zh-CN" | "zh-TW" | "en-US") {
  return locale === "en-US" ? "Untitled image" : "未命名影像";
}
