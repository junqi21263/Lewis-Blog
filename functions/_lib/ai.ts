import { parseJsonText } from "./api";

export type CorpusItem = {
  type: "post" | "photo" | "video";
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  content: string;
  href: string;
  tags: string[];
};

type WorkersAi = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

type VectorizeBinding = {
  insert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, string | number | boolean> }>) => Promise<unknown>;
  query: (vector: number[], options?: { topK?: number; returnMetadata?: boolean }) => Promise<unknown>;
};

export type AiEnv = Env & {
  AI?: WorkersAi;
  VECTOR_INDEX?: VectorizeBinding;
  CF_PAGES_BRANCH?: string;
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  tag_names: string | null;
};

type PhotoRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  location: string | null;
  camera: string | null;
  lens: string | null;
  tags: string | null;
};

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  platform: string;
  duration: string | null;
};

function words(value: string) {
  return value.toLowerCase().match(/[\p{L}\p{N}’'-]+/gu) ?? [];
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function excerpt(value: string, limit = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}

export function deterministicTags(text: string, limit = 6) {
  const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "about", "your", "you", "are", "was", "were", "have", "has", "will", "not"]);
  const counts = new Map<string, number>();
  for (const word of words(text)) {
    if (word.length < 4 || stop.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word.replace(/^\w/, (letter) => letter.toUpperCase()));
}

export function deterministicSummary(text: string) {
  const sentences = text.replace(/```[\s\S]*?```/g, " ").split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  const tldr = excerpt(sentences[0] ?? text, 220);
  const keyTakeaways = sentences.slice(0, 3).map((sentence) => excerpt(sentence, 140));
  const wordCount = words(text).length;
  const readingDifficulty = wordCount > 1600 ? "Deep read" : wordCount > 700 ? "Moderate" : "Light";

  return {
    summary: excerpt(sentences.slice(0, 3).join(" "), 420),
    tldr,
    keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [tldr],
    readingDifficulty,
  };
}

export async function listPublishedCorpus(db: D1Database): Promise<CorpusItem[]> {
  const [posts, photos, videos] = await Promise.all([
    db
      .prepare(
        `SELECT posts.id, posts.title, posts.slug, posts.subtitle, posts.excerpt, posts.content, GROUP_CONCAT(tags.name) AS tag_names
         FROM posts
         LEFT JOIN post_tags ON post_tags.post_id = posts.id
         LEFT JOIN tags ON tags.id = post_tags.tag_id
         WHERE posts.status = 'published'
         GROUP BY posts.id
         ORDER BY posts.published_at DESC, posts.updated_at DESC`,
      )
      .all<PostRow>(),
    db.prepare("SELECT id, title, description, image_url, alt_text, location, camera, lens, tags FROM photos ORDER BY featured DESC, taken_at DESC").all<PhotoRow>(),
    db.prepare("SELECT id, title, description, video_url, platform, duration FROM videos ORDER BY featured DESC, updated_at DESC").all<VideoRow>(),
  ]);

  return [
    ...posts.results.map((post) => ({
      type: "post" as const,
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.excerpt || post.subtitle || "",
      content: [post.title, post.subtitle, post.excerpt, post.content, post.tag_names].filter(Boolean).join("\n\n"),
      href: `/journal/${post.slug}`,
      tags: post.tag_names ? post.tag_names.split(",").filter(Boolean) : [],
    })),
    ...photos.results.map((photo) => ({
      type: "photo" as const,
      id: photo.id,
      title: photo.title,
      description: photo.description || photo.alt_text || photo.location || "",
      content: [photo.title, photo.description, photo.alt_text, photo.location, photo.camera, photo.lens, photo.tags].filter(Boolean).join("\n\n"),
      href: "/gallery",
      tags: parseJsonText(photo.tags, []) as string[],
    })),
    ...videos.results.map((video) => ({
      type: "video" as const,
      id: video.id,
      title: video.title,
      description: video.description || `${video.platform} ${video.duration || ""}`.trim(),
      content: [video.title, video.description, video.platform, video.duration].filter(Boolean).join("\n\n"),
      href: "/films",
      tags: [video.platform],
    })),
  ];
}

export function lexicalSearch(corpus: CorpusItem[], query: string, limit = 6) {
  const queryWords = unique(words(query));
  if (queryWords.length === 0) return corpus.slice(0, limit);

  return corpus
    .map((item) => {
      const haystack = `${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`.toLowerCase();
      const score = queryWords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function relatedCorpusItems(corpus: CorpusItem[], sourceId: string, limit = 3) {
  const source = corpus.find((item) => item.type === "post" && (item.id === sourceId || item.slug === sourceId));
  if (!source) return [];

  const sourceWords = new Set(unique([...words(source.title), ...words(source.description), ...words(source.content)].filter((word) => word.length > 4)));
  const sourceTags = new Set(source.tags.map((tag) => tag.toLowerCase()));

  return corpus
    .filter((item) => item.type === "post" && item.id !== source.id)
    .map((item) => {
      const itemTags = item.tags.map((tag) => tag.toLowerCase());
      const sharedTags = itemTags.filter((tag) => sourceTags.has(tag)).length * 4;
      const textWords = unique([...words(item.title), ...words(item.description), ...words(item.content)].filter((word) => word.length > 4));
      const sharedTerms = textWords.filter((word) => sourceWords.has(word)).length;
      return { item, score: sharedTags + sharedTerms };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map(({ item }) => item);
}

export async function runTextAi(env: AiEnv, prompt: string) {
  if (env.CF_PAGES_BRANCH === "local") return "";
  if (!env.AI) return "";
  const output = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { prompt });
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    const record = output as Record<string, unknown>;
    return String(record.response ?? record.result ?? record.text ?? "");
  }
  return "";
}

export async function embedText(env: AiEnv, text: string) {
  if (env.CF_PAGES_BRANCH === "local") return null;
  if (!env.AI) return null;
  const output = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [text.slice(0, 4000)] });
  const data = output && typeof output === "object" ? (output as { data?: unknown }).data : null;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
  return data[0].filter((value): value is number => typeof value === "number");
}
