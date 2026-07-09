"use client";

import EditorialImage from "@/components/media/EditorialImage";
import { fragmentBodyClassName } from "@/components/fragments/fragmentPresentation";
import { parseMarkdownBlocks } from "@/lib/editor";

export type FragmentCardData = {
  id: string;
  content: string;
  location: string;
  weather: string;
  camera: string;
  mood: string;
  date: string;
  images: Array<{ url: string; alt: string }>;
};

export type FragmentCardLabels = {
  location: string;
  weather: string;
  camera: string;
  mood: string;
};

type FragmentCardProps = {
  fragment: FragmentCardData;
  labels: FragmentCardLabels;
  locale: string;
  preview?: boolean;
};

function formatDate(value: string, locale: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(
    locale === "zh-CN" ? "zh-Hans-CN" : locale === "zh-TW" ? "zh-Hant-TW" : "en-US",
    { year: "numeric", month: "2-digit", day: "2-digit" },
  ).format(new Date(value));
}

function FragmentContent({ content }: { content: string }) {
  const blocks = parseMarkdownBlocks(content, { preserveLineBreaks: true });

  return (
    <div className={`${fragmentBodyClassName} space-y-5`}>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={`${block.type}-${index}`}
              className={block.ordered ? "list-decimal space-y-2 pl-6" : "list-disc space-y-2 pl-6"}
            >
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </List>
          );
        }
        if (block.type === "quote") {
          return <blockquote key={`${block.type}-${index}`} className="border-l border-outline-variant/30 pl-5 italic text-on-surface-variant">{block.text}</blockquote>;
        }
        if (block.type === "heading") {
          return <h3 key={`${block.type}-${index}`} className="font-serif text-[1.35em] leading-tight">{block.text}</h3>;
        }
        if (block.type === "paragraph") {
          return <p key={`${block.type}-${index}`}>{block.text}</p>;
        }
        if (block.type === "code") {
          return <pre key={`${block.type}-${index}`} className="overflow-x-auto border border-outline-variant/10 p-4 font-mono text-sm"><code>{block.code}</code></pre>;
        }
        return null;
      })}
    </div>
  );
}

export default function FragmentCard({ fragment, labels, locale, preview = false }: FragmentCardProps) {
  const metadata = [
    { label: labels.location, value: fragment.location },
    { label: labels.weather, value: fragment.weather },
    { label: labels.camera, value: fragment.camera },
    { label: labels.mood, value: fragment.mood },
  ].filter((item) => item.value);

  return (
    <article className={preview ? "border-y border-outline-variant/10 py-8 md:py-12" : "border-t border-outline-variant/10 py-8 md:py-12"}>
      <div className="grid gap-7 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
        <aside className="space-y-4 text-on-surface-variant">
          <div className="font-mono text-[11px] uppercase tracking-[0.24em]">
            {formatDate(fragment.date, locale)}
          </div>
          {metadata.map((item) => (
            <div key={item.label}>
              <div className="label-mono mb-1">{item.label}</div>
              <div className="text-body-sm leading-6 text-on-surface-variant">{item.value}</div>
            </div>
          ))}
        </aside>

        <div className="min-w-0">
          {fragment.content ? <FragmentContent content={fragment.content} /> : null}
          {fragment.images.length > 0 ? (
            <div className={`mt-7 grid gap-3 md:gap-4 ${fragment.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {fragment.images.slice(0, 4).map((image, index) => (
                <EditorialImage
                  key={`${fragment.id}-${image.url}-${index}`}
                  alt={image.alt || fragment.content || "Fragment image"}
                  aspectRatio={fragment.images.length === 1 ? "cinema" : "square"}
                  className="w-full"
                  frameClassName="w-full border border-outline-variant/10 bg-surface-container-low"
                  grayscale
                  revealColorOnHover
                  sizes="(min-width: 768px) 50vw, 100vw"
                  src={image.url}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
