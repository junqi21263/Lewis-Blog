const truthy = new Set(["1", "true", "yes", "on"]);

function enabled(value: string | undefined) {
  return value ? truthy.has(value.toLowerCase()) : false;
}

export const FEATURE_AI_ARCHIVE = enabled(process.env.NEXT_PUBLIC_FEATURE_AI_ARCHIVE) || enabled(process.env.FEATURE_AI_ARCHIVE) || false;
export const FEATURE_FRAGMENT_AI_SUGGESTIONS =
  enabled(process.env.NEXT_PUBLIC_FEATURE_FRAGMENT_AI_SUGGESTIONS) ||
  enabled(process.env.FEATURE_FRAGMENT_AI_SUGGESTIONS) ||
  false;
