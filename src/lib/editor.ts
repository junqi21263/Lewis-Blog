export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "image"; alt: string; src: string; layout?: "full-width" }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "mdx"; code: string };

export type TocItem = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
};

export type Footnote = {
  id: string;
  label: string;
  text: string;
};

export type ArticleAnalysis = {
  blocks: MarkdownBlock[];
  toc: TocItem[];
  footnotes: Footnote[];
  wordCount: number;
  readingMinutes: number;
  readingTime: string;
};

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createHeadingId(text: string) {
  return slugifyTitle(text) || "section";
}

function uniqueHeadingId(text: string, seen: Map<string, number>) {
  const base = createHeadingId(text);
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function getWordCount(content: string) {
  const withoutCode = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\[\^[^\]]+]:.*$/gm, " ")
    .replace(/\[\^[^\]]+]/g, " ");
  const words = withoutCode.match(/[\p{L}\p{N}’'-]+/gu);
  return words?.length ?? 0;
}

export function getReadingMinutes(content: string, wordsPerMinute = 220) {
  return Math.max(1, Math.ceil(getWordCount(content) / wordsPerMinute));
}

export function getReadingTime(content: string, wordsPerMinute = 220) {
  const minutes = getReadingMinutes(content, wordsPerMinute);
  return `${minutes} min read`;
}

export function extractFootnotes(markdown: string): Footnote[] {
  const footnotes: Footnote[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  for (const line of lines) {
    const match = line.match(/^\[\^([^\]]+)]:\s+(.+)$/);
    if (match) {
      footnotes.push({
        id: `footnote-${slugifyTitle(match[1]) || footnotes.length + 1}`,
        label: match[1],
        text: match[2],
      });
    }
  }

  return footnotes;
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  const headingIds = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^\[\^[^\]]+]:\s+/.test(trimmed)) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.replace(/^```/, "").trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      index += 1;
      continue;
    }

    if (/^<[A-Z][\s\S]*>?/.test(trimmed)) {
      const mdxLines = [line];
      index += 1;
      while (index < lines.length && lines[index].trim()) {
        mdxLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "mdx", code: mdxLines.join("\n") });
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)]\((\S+)(?:\s+"([^"]*)")?\)$/);
    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2], layout: imageMatch[3] === "full-width" ? "full-width" : undefined });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const text = headingMatch[2];
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text,
        id: uniqueHeadingId(text, headingIds),
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        const match = ordered ? item.match(/^\d+\.\s+(.+)$/) : item.match(/^[-*]\s+(.+)$/);
        if (!match) {
          break;
        }
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (
        /^(#{1,3})\s+/.test(next) ||
        next.startsWith(">") ||
        next.startsWith("```") ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        /^\[\^[^\]]+]:\s+/.test(next)
      ) {
        break;
      }
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function analyzeArticleContent(markdown: string): ArticleAnalysis {
  const blocks = parseMarkdownBlocks(markdown);
  const wordCount = getWordCount(markdown);
  const readingMinutes = getReadingMinutes(markdown);

  return {
    blocks,
    toc: blocks
      .filter((block): block is Extract<MarkdownBlock, { type: "heading" }> => block.type === "heading")
      .map((block) => ({
        id: block.id,
        title: block.text,
        level: block.level,
      })),
    footnotes: extractFootnotes(markdown),
    wordCount,
    readingMinutes,
    readingTime: `${readingMinutes} min read`,
  };
}
