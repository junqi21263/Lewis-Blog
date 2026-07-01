type OgImageOptions = {
  title: string;
  kicker?: string | null;
  subtitle?: string | null;
  footerLabel: string;
  titleSize?: number;
  centered?: boolean;
};

const FONT_PATH = "/fonts/PlayfairDisplay-Bold.ttf";

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

let cachedFontDataUri: string | null = null;

export async function loadEmbeddedPlayfair(origin: string) {
  if (cachedFontDataUri) {
    return cachedFontDataUri;
  }

  const response = await fetch(`${origin}${FONT_PATH}`);
  if (!response.ok) {
    throw new Error(`Failed to load Playfair Display font: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  cachedFontDataUri = `data:font/ttf;base64,${toBase64(bytes)}`;
  return cachedFontDataUri;
}

function wrapTitle(title: string, maxLineLength: number) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxLineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word);
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3).map((line, index, all) => {
    if (index === all.length - 1) {
      return truncate(line, maxLineLength + 10);
    }
    return line;
  });
}

export async function renderOgImage(origin: string, options: OgImageOptions) {
  const fontDataUri = await loadEmbeddedPlayfair(origin);
  const lines = wrapTitle(options.title, options.centered ? 20 : 24);
  const titleSize = options.titleSize ?? 88;
  const lineHeight = Math.round(titleSize * 1.02);
  const titleBlockHeight = lines.length * lineHeight;
  const titleStartY = options.centered ? Math.round(315 - titleBlockHeight / 2 + titleSize * 0.82) : 252;
  const subtitle = options.subtitle ? truncate(options.subtitle, 120) : null;

  const titleSvg = lines
    .map((line, index) => {
      const y = titleStartY + index * lineHeight;
      return `<text x="${options.centered ? "600" : "100"}" y="${y}" text-anchor="${options.centered ? "middle" : "start"}" fill="#f4f1ed" font-family="'Playfair Display', Georgia, serif" font-size="${titleSize}" letter-spacing="0">${escapeXml(line)}</text>`;
    })
    .join("");

  const subtitleSvg = subtitle
    ? `<text x="${options.centered ? "600" : "100"}" y="${options.centered ? titleStartY + titleBlockHeight / 2 + 92 : "428"}" text-anchor="${options.centered ? "middle" : "start"}" fill="#c6c1ba" font-family="Inter, Arial, sans-serif" font-size="27" letter-spacing="0">${escapeXml(subtitle)}</text>`
    : "";

  const kickerSvg = options.kicker
    ? `<text x="100" y="112" fill="#b9b3ac" font-family="Inter, Arial, sans-serif" font-size="18" letter-spacing="7">${escapeXml(options.kicker.toUpperCase())}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(options.title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="52%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#252525"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="78%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="55%" stop-color="rgba(255,255,255,0.02)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="1.05" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.07"/>
      </feComponentTransfer>
    </filter>
    <pattern id="guide" width="1200" height="630" patternUnits="userSpaceOnUse">
      <path d="M0 488H1200" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <path d="M78 0V630" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
      <path d="M1122 0V630" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
    </pattern>
    <style>
      @font-face {
        font-family: 'Playfair Display';
        src: url('${fontDataUri}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#guide)" opacity="0.8"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity="0.95"/>
  <rect x="72" y="72" width="1056" height="486" rx="0" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  ${kickerSvg}
  ${titleSvg}
  ${subtitleSvg}
  <text x="94" y="564" fill="#ebe6de" font-family="'Playfair Display', Georgia, serif" font-size="33">${escapeXml(options.footerLabel)}</text>
</svg>`;
}

