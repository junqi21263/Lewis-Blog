"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/editor";
import { cn } from "@/lib/utils";

type ArticleTocProps = {
  items: TocItem[];
};

export default function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] },
    );

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="border-t border-outline-variant/10 pt-8">
      <div className="label-mono mb-5">Contents</div>
      <div className="flex gap-4 overflow-x-auto pb-2 md:block md:overflow-visible md:pb-0">
        {items.map((item) => (
          <a
            key={item.id}
            className={cn(
              "block min-w-fit border-l border-outline-variant/10 py-2 pl-4 font-mono text-[11px] uppercase tracking-widest text-on-surface-variant transition hover:text-on-background",
              item.level > 2 && "md:ml-4",
              activeId === item.id && "border-secondary text-on-background",
            )}
            href={`#${item.id}`}
          >
            {item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
