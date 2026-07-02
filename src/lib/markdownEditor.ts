export type MarkdownCommand = "h1" | "h2" | "paragraph" | "italic" | "quote" | "link" | "image" | "code";

export type MarkdownSelection = {
  start: number;
  end: number;
};

export type MarkdownEditResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  replacementStart: number;
  replacementEnd: number;
  replacement: string;
};

function lineStart(value: string, position: number) {
  return value.lastIndexOf("\n", Math.max(0, position - 1)) + 1;
}

function lineEnd(value: string, position: number) {
  const nextBreak = value.indexOf("\n", position);
  return nextBreak === -1 ? value.length : nextBreak;
}

function replaceRange(value: string, start: number, end: number, replacement: string): MarkdownEditResult {
  return {
    value: `${value.slice(0, start)}${replacement}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + replacement.length,
    replacementStart: start,
    replacementEnd: end,
    replacement,
  };
}

function prefixSelectedLines(value: string, selection: MarkdownSelection, prefix: string, fallback: string): MarkdownEditResult {
  if (selection.start === selection.end) {
    return replaceRange(value, selection.start, selection.end, fallback);
  }

  const start = lineStart(value, selection.start);
  const end = lineEnd(value, selection.end);
  const selected = value.slice(start, end);
  const replacement = selected
    .split("\n")
    .map((line) => {
      const withoutHeading = line.replace(/^#{1,6}\s+/, "");
      return withoutHeading.trim() ? `${prefix}${withoutHeading}` : prefix.trimEnd();
    })
    .join("\n");

  return {
    value: `${value.slice(0, start)}${replacement}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + replacement.length,
    replacementStart: start,
    replacementEnd: end,
    replacement,
  };
}

function paragraph(value: string, selection: MarkdownSelection): MarkdownEditResult {
  if (selection.start === selection.end) {
    return replaceRange(value, selection.start, selection.end, "Paragraph text");
  }

  const start = lineStart(value, selection.start);
  const end = lineEnd(value, selection.end);
  const selected = value.slice(start, end);
  const replacement = selected
    .split("\n")
    .map((line) => line.replace(/^(#{1,6}|>)\s?/, ""))
    .join("\n");

  return {
    value: `${value.slice(0, start)}${replacement}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + replacement.length,
    replacementStart: start,
    replacementEnd: end,
    replacement,
  };
}

function wrapInline(value: string, selection: MarkdownSelection, before: string, after: string, fallback: string): MarkdownEditResult {
  const selected = value.slice(selection.start, selection.end) || fallback;
  const replacement = `${before}${selected}${after}`;
  const result = replaceRange(value, selection.start, selection.end, replacement);
  const caretStart = selection.start + before.length;
  return {
    value: result.value,
    selectionStart: caretStart,
    selectionEnd: caretStart + selected.length,
    replacementStart: result.replacementStart,
    replacementEnd: result.replacementEnd,
    replacement: result.replacement,
  };
}

function code(value: string, selection: MarkdownSelection): MarkdownEditResult {
  const selected = value.slice(selection.start, selection.end);
  const isMultiline = selected.includes("\n");

  if (!selected) {
    return wrapInline(value, selection, "`", "`", "code");
  }

  if (isMultiline) {
    const replacement = `\`\`\`\n${selected}\n\`\`\``;
    return {
      value: `${value.slice(0, selection.start)}${replacement}${value.slice(selection.end)}`,
      selectionStart: selection.start + 4,
      selectionEnd: selection.start + 4 + selected.length,
      replacementStart: selection.start,
      replacementEnd: selection.end,
      replacement,
    };
  }

  return wrapInline(value, selection, "`", "`", selected);
}

export function applyMarkdownCommand(value: string, selection: MarkdownSelection, command: MarkdownCommand): MarkdownEditResult {
  switch (command) {
    case "h1":
      return prefixSelectedLines(value, selection, "# ", "# Heading");
    case "h2":
      return prefixSelectedLines(value, selection, "## ", "## Heading");
    case "paragraph":
      return paragraph(value, selection);
    case "italic":
      return wrapInline(value, selection, "*", "*", "text");
    case "quote":
      return prefixSelectedLines(value, selection, "> ", "> Quote");
    case "link":
      return wrapInline(value, selection, "[", "](https://)", "text");
    case "image":
      return replaceRange(value, selection.start, selection.end, "![alt text](image-url)");
    case "code":
      return code(value, selection);
  }
}
