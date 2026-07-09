export type CoverDisplayMode = "cover" | "contain" | "original";

export const coverDisplayModes = ["cover", "contain", "original"] as const satisfies CoverDisplayMode[];

export function normalizeCoverDisplayMode(value: unknown): CoverDisplayMode {
  return coverDisplayModes.includes(value as CoverDisplayMode) ? (value as CoverDisplayMode) : "cover";
}

export function normalizeFocalPoint(value: unknown, fallback = 50) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

export function objectFitForCover(mode: CoverDisplayMode) {
  if (mode === "contain" || mode === "original") {
    return "contain";
  }
  return "cover";
}

export function objectPositionForCover(x: number, y: number) {
  return `${normalizeFocalPoint(x)}% ${normalizeFocalPoint(y)}%`;
}
