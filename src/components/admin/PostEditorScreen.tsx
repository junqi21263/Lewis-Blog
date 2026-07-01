"use client";

import {
  CalendarClock,
  Check,
  Code,
  Eye,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Languages,
  LinkIcon,
  Lock,
  Quote,
  RotateCcw,
  Save,
  Send,
  Type,
  Unlock,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import StatusBadge from "@/components/admin/StatusBadge";
import { createEmptyPost, getCategoryById, getPostTags, type Post, type TranslationField, type TranslationLocks } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import type { Locale } from "@/i18n/config";
import type { LocalizedTextMap } from "@/i18n/content";
import { getReadingTime, getWordCount, parseMarkdownBlocks, slugifyTitle, type MarkdownBlock } from "@/lib/editor";
import { cn } from "@/lib/utils";

type PostEditorScreenProps = {
  postId?: string;
};

type EditorStatus = "draft" | "published" | "scheduled" | "archived";
type SaveState = "Unsaved" | "Saving" | "Saved";
type EditorLocale = Locale;
type LocalizedEditorFields = Record<Locale, Record<TranslationField, string>>;

type EditorDraft = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  categoryId: string;
  tags: string;
  coverImage: string;
  excerpt: string;
  content: string;
  status: EditorStatus;
  featured: boolean;
  pinned: boolean;
  seoTitle: string;
  seoDescription: string;
  localizedFields: LocalizedEditorFields;
  translationLocks: TranslationLocks;
  publishedAt: string;
  createdAt: string;
};

const editorLocales: Array<{ locale: EditorLocale; shortLabel: string; label: string; hint: string }> = [
  { locale: "zh-CN", shortLabel: "简", label: "简体中文", hint: "Source" },
  { locale: "zh-TW", shortLabel: "繁", label: "繁體中文", hint: "Traditional" },
  { locale: "en-US", shortLabel: "EN", label: "English", hint: "Editorial" },
];

const translationFieldLabels: Array<{ field: TranslationField; label: string }> = [
  { field: "title", label: "Title" },
  { field: "excerpt", label: "Excerpt" },
  { field: "content", label: "Content" },
  { field: "seoTitle", label: "SEO Title" },
  { field: "seoDescription", label: "SEO Description" },
];

const toolbarItems = [
  { label: "Heading 1", icon: Heading1 },
  { label: "Heading 2", icon: Heading2 },
  { label: "Paragraph", icon: Type },
  { label: "Italic", icon: Italic },
  { label: "Quote", icon: Quote },
  { label: "Link", icon: LinkIcon },
  { label: "Image", icon: ImageIcon },
  { label: "Code", icon: Code },
];

function fieldFromMap(map: LocalizedTextMap, locale: Locale, fallback = "") {
  return map[locale] ?? (locale === "zh-CN" ? fallback : "");
}

function localizedFieldsFromPost(post: Post): LocalizedEditorFields {
  return {
    "zh-CN": {
      title: fieldFromMap(post.titleJson, "zh-CN", post.title),
      excerpt: fieldFromMap(post.excerptJson, "zh-CN", post.excerpt),
      content: fieldFromMap(post.contentJson, "zh-CN", post.content),
      seoTitle: fieldFromMap(post.seoTitleJson, "zh-CN", post.seoTitle || post.title),
      seoDescription: fieldFromMap(post.seoDescriptionJson, "zh-CN", post.seoDescription || post.excerpt),
    },
    "zh-TW": {
      title: fieldFromMap(post.titleJson, "zh-TW"),
      excerpt: fieldFromMap(post.excerptJson, "zh-TW"),
      content: fieldFromMap(post.contentJson, "zh-TW"),
      seoTitle: fieldFromMap(post.seoTitleJson, "zh-TW"),
      seoDescription: fieldFromMap(post.seoDescriptionJson, "zh-TW"),
    },
    "en-US": {
      title: fieldFromMap(post.titleJson, "en-US"),
      excerpt: fieldFromMap(post.excerptJson, "en-US"),
      content: fieldFromMap(post.contentJson, "en-US"),
      seoTitle: fieldFromMap(post.seoTitleJson, "en-US"),
      seoDescription: fieldFromMap(post.seoDescriptionJson, "en-US"),
    },
  };
}

function createInitialDraft(post?: Post, tagNames = ""): EditorDraft {
  const emptyPost = post ?? createEmptyPost();
  const localizedFields = localizedFieldsFromPost(emptyPost);
  const sourceFields = localizedFields["zh-CN"];
  const title = sourceFields.title;
  const excerpt = sourceFields.excerpt;
  const publishedAt = post?.publishedAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(post.publishedAt) ? post.publishedAt : "";

  return {
    id: emptyPost.id,
    title,
    subtitle: emptyPost.subtitle,
    slug: emptyPost.slug,
    categoryId: emptyPost.categoryId,
    tags: tagNames,
    coverImage: emptyPost.coverImage.src,
    excerpt,
    content: sourceFields.content,
    status: emptyPost.status,
    featured: emptyPost.featured,
    pinned: emptyPost.pinned,
    seoTitle: sourceFields.seoTitle,
    seoDescription: sourceFields.seoDescription,
    localizedFields,
    translationLocks: emptyPost.translationLocks ?? {},
    publishedAt,
    createdAt: emptyPost.createdAt,
  };
}

function localizedMapFromDraft(draft: EditorDraft, field: TranslationField) {
  return Object.fromEntries(
    editorLocales
      .map(({ locale }) => [locale, draft.localizedFields[locale][field]] as const)
      .filter(([, value]) => value.trim()),
  ) as LocalizedTextMap;
}

function draftToPost(draft: EditorDraft, tagIds: string[]): Post {
  const now = new Date().toISOString().slice(0, 16);
  const sourceFields = draft.localizedFields["zh-CN"];
  const fallbackTitle = sourceFields.title.trim() || draft.title.trim() || "Untitled Editorial";
  const slug = draft.slug.trim() || slugifyTitle(fallbackTitle);
  const sourceExcerpt = sourceFields.excerpt || draft.excerpt || draft.subtitle;
  const sourceContent = sourceFields.content || draft.content;
  const sourceSeoTitle = sourceFields.seoTitle || draft.seoTitle || fallbackTitle;
  const sourceSeoDescription = sourceFields.seoDescription || draft.seoDescription || sourceExcerpt;

  return {
    id: draft.id || slug || `post-${Date.now()}`,
    title: fallbackTitle,
    titleJson: localizedMapFromDraft(draft, "title"),
    subtitle: draft.subtitle,
    slug,
    categoryId: draft.categoryId,
    tagIds,
    coverImage: {
      src: draft.coverImage,
      alt: draft.coverImage ? `${fallbackTitle} cover image.` : "",
    },
    excerpt: sourceExcerpt,
    excerptJson: localizedMapFromDraft(draft, "excerpt"),
    content: sourceContent,
    contentJson: localizedMapFromDraft(draft, "content"),
    status: draft.status,
    featured: draft.featured,
    pinned: draft.pinned,
    seoTitle: sourceSeoTitle,
    seoTitleJson: localizedMapFromDraft(draft, "seoTitle"),
    seoDescription: sourceSeoDescription,
    seoDescriptionJson: localizedMapFromDraft(draft, "seoDescription"),
    translationLocks: draft.translationLocks,
    publishedAt: draft.status === "published" && !draft.publishedAt ? now : draft.publishedAt,
    createdAt: draft.createdAt || now,
    updatedAt: now,
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="label-mono mb-2 block">{children}</span>;
}

function ToggleField({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 border-t border-outline-variant/10 pt-4">
      <span>
        <span className="block text-body-md text-on-surface">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{hint}</span>
      </span>
      <span className="relative inline-flex items-center">
        <input checked={checked} className="peer sr-only" type="checkbox" onChange={(event) => onChange(event.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-surface-variant transition peer-checked:bg-primary" />
        <span className="absolute left-1 top-1 size-4 rounded-full bg-on-surface transition peer-checked:translate-x-5 peer-checked:bg-background" />
      </span>
    </label>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+]\([^)]+\))/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-surface-container-low px-1.5 py-0.5 font-mono text-sm text-on-surface">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={`${part}-${index}`} className="border-b border-outline-variant/40 text-on-surface transition hover:text-secondary" href={link[2]}>
          {link[1]}
        </a>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function PreviewBlock({ block }: { block: MarkdownBlock }) {
  if (block.type === "heading") {
    const className =
      block.level === 1
        ? "mb-8 mt-2 font-serif text-headline-lg text-on-background"
        : block.level === 2
          ? "mb-6 mt-14 font-serif text-headline-lg text-on-background"
          : "mb-5 mt-10 font-serif text-headline-md text-on-background";
    const Heading = `h${Math.min(block.level + 1, 4)}` as "h2" | "h3" | "h4";
    return <Heading className={className}>{renderInline(block.text)}</Heading>;
  }

  if (block.type === "quote") {
    return (
      <blockquote className="my-12 border-l border-outline-variant/30 py-3 pl-7">
        <p className="font-serif text-headline-md italic text-on-background">{renderInline(block.text)}</p>
      </blockquote>
    );
  }

  if (block.type === "code" || block.type === "mdx") {
    return (
      <div className="my-10 rounded border border-outline-variant/10 bg-surface-container-low p-5">
        <div className="label-mono mb-4 border-b border-outline-variant/10 pb-2">{block.type === "mdx" ? "MDX Block" : block.language || "Code"}</div>
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-on-background">
          <code>{block.type === "mdx" ? block.code : block.code}</code>
        </pre>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="my-12 overflow-hidden bg-surface-container-low">
        <div className="aspect-[16/10] bg-cover bg-center grayscale" style={{ backgroundImage: `url("${block.src}")` }} />
        <figcaption className="label-mono mt-3">{block.alt}</figcaption>
      </figure>
    );
  }

  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List className={cn("my-8 space-y-3 pl-6 text-body-lg text-on-background", block.ordered ? "list-decimal" : "list-disc")}>
        {block.items.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </List>
    );
  }

  return <p className="mb-8 text-body-lg text-on-background">{renderInline(block.text)}</p>;
}

export default function PostEditorScreen({ postId }: PostEditorScreenProps) {
  const { data, isReady, updatePost, error } = useCmsData();
  const post = data.posts.find((item) => item.id === postId);
  const isNew = !postId;
  const [draft, setDraft] = useState<EditorDraft>(() => createInitialDraft(post));
  const [saveState, setSaveState] = useState<SaveState>("Saved");
  const [saveError, setSaveError] = useState("");
  const [translationNotice, setTranslationNotice] = useState("");
  const [activeLocale, setActiveLocale] = useState<EditorLocale>("zh-CN");
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(postId));
  const [hydrated, setHydrated] = useState(false);
  const initializedKeyRef = useRef("");
  const lastSavedRef = useRef("");
  const autoSaveTimerRef = useRef<number | null>(null);
  const savingTimerRef = useRef<number | null>(null);

  const activeFields = draft.localizedFields[activeLocale];
  const activeTitle = activeFields.title || (activeLocale === "zh-CN" ? draft.title : "");
  const activeExcerpt = activeFields.excerpt || (activeLocale === "zh-CN" ? draft.excerpt : "");
  const activeContent = activeFields.content || (activeLocale === "zh-CN" ? draft.content : "");
  const activeSeoTitle = activeFields.seoTitle || (activeLocale === "zh-CN" ? draft.seoTitle : "");
  const activeSeoDescription = activeFields.seoDescription || (activeLocale === "zh-CN" ? draft.seoDescription : "");
  const wordCount = useMemo(() => getWordCount(activeContent), [activeContent]);
  const readingTime = useMemo(() => getReadingTime(activeContent), [activeContent]);
  const tagList = useMemo(
    () =>
      draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [draft.tags],
  );

  const category = getCategoryById(data, draft.categoryId);
  const knownTagNames = data.tags.map((tag) => tag.name);
  const draftTagIds = useMemo(() => {
    const byName = new Map(data.tags.map((tag) => [tag.name.toLowerCase(), tag.id]));
    return draft.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .map((tag) => byName.get(tag) ?? slugifyTitle(tag));
  }, [data.tags, draft.tags]);

  const previewSource = {
    title: activeTitle || draft.title,
    excerpt: activeExcerpt || draft.subtitle || draft.excerpt || "A new studio note in progress.",
    content: activeContent || draft.content,
  };
  const previewBlocks = useMemo(() => parseMarkdownBlocks(previewSource.content), [previewSource.content]);
  const previewReadingTime = useMemo(() => getReadingTime(previewSource.content), [previewSource.content]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const key = postId ?? "new";
    if (initializedKeyRef.current === key) {
      return;
    }
    const tagNames = post ? getPostTags(data, post).map((tag) => tag.name).join(", ") : "";
    const nextDraft = createInitialDraft(post, tagNames);
    setDraft(nextDraft);
    lastSavedRef.current = JSON.stringify(nextDraft);
    setSaveState("Saved");
    setHydrated(true);
    initializedKeyRef.current = key;
  }, [data, isReady, post, postId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) {
      setSaveState("Saved");
      return;
    }

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    if (savingTimerRef.current) {
      window.clearTimeout(savingTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      setSaveState("Saving");
      savingTimerRef.current = window.setTimeout(() => {
        void (async () => {
          try {
            const result = await updatePost(draftToPost(draft, draftTagIds));
            lastSavedRef.current = serialized;
            setSaveError("");
            setTranslationNotice(result.warnings.join(" "));
            setSaveState("Saved");
          } catch (requestError) {
            setSaveError(requestError instanceof Error ? requestError.message : "Unable to save changes.");
            setSaveState("Unsaved");
          } finally {
            autoSaveTimerRef.current = null;
            savingTimerRef.current = null;
          }
        })();
      }, 250);
    }, 900);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      if (savingTimerRef.current) {
        window.clearTimeout(savingTimerRef.current);
      }
    };
  }, [draft, draftTagIds, hydrated, updatePost]);

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (saveState !== "Saved") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [saveState]);

  function updateDraft<Key extends keyof EditorDraft>(key: Key, value: EditorDraft[Key]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugWasEdited) {
        next.slug = slugifyTitle(String(value));
        next.seoTitle = String(value);
      }
      return next;
    });
    setSaveState("Unsaved");
  }

  function updateLocalizedField(field: TranslationField, value: string) {
    setDraft((current) => {
      const nextLocalizedFields: LocalizedEditorFields = {
        ...current.localizedFields,
        [activeLocale]: {
          ...current.localizedFields[activeLocale],
          [field]: value,
        },
      };
      const next: EditorDraft = { ...current, localizedFields: nextLocalizedFields };

      if (activeLocale === "zh-CN") {
        if (field === "title") {
          next.title = value;
          if (!slugWasEdited) {
            next.slug = slugifyTitle(value);
          }
          if (!current.localizedFields["zh-CN"].seoTitle || current.localizedFields["zh-CN"].seoTitle === current.title) {
            next.seoTitle = value;
            next.localizedFields = {
              ...next.localizedFields,
              "zh-CN": {
                ...next.localizedFields["zh-CN"],
                seoTitle: value,
              },
            };
          }
        }
        if (field === "excerpt") next.excerpt = value;
        if (field === "content") next.content = value;
        if (field === "seoTitle") next.seoTitle = value;
        if (field === "seoDescription") next.seoDescription = value;
      }

      return next;
    });
    setSaveState("Unsaved");
  }

  function toggleTranslationLock(locale: EditorLocale, field: TranslationField) {
    if (locale === "zh-CN") {
      return;
    }
    setDraft((current) => ({
      ...current,
      translationLocks: {
        ...current.translationLocks,
        [locale]: {
          ...(current.translationLocks[locale] ?? {}),
          [field]: !current.translationLocks[locale]?.[field],
        },
      },
    }));
    setSaveState("Unsaved");
  }

  async function persistDraft(nextDraft = draft, generateTranslations = false) {
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (savingTimerRef.current) {
      window.clearTimeout(savingTimerRef.current);
      savingTimerRef.current = null;
    }

    setSaveState("Saving");
    try {
      const result = await updatePost(draftToPost(nextDraft, draftTagIds), { generateTranslations });
      const savedDraft = generateTranslations ? createInitialDraft(result.data, nextDraft.tags) : nextDraft;
      if (generateTranslations) {
        setDraft(savedDraft);
      }
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" "));
      setSaveState("Saved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : "Unable to save changes.");
      setSaveState("Unsaved");
    }
  }

  async function saveAsDraft() {
    const nextDraft: EditorDraft = { ...draft, status: "draft", publishedAt: "" };
    setDraft(nextDraft);
    await persistDraft(nextDraft, true);
  }

  async function publishNow() {
    const nextDraft: EditorDraft = {
      ...draft,
      status: "published",
      publishedAt: draft.publishedAt || new Date().toISOString().slice(0, 16),
    };
    setDraft(nextDraft);
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (savingTimerRef.current) {
      window.clearTimeout(savingTimerRef.current);
      savingTimerRef.current = null;
    }
    setSaveState("Saving");
    try {
      const result = await updatePost(draftToPost(nextDraft, draftTagIds), { generateTranslations: true });
      const savedDraft = createInitialDraft(result.data, nextDraft.tags);
      setDraft(savedDraft);
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" "));
      setSaveState("Saved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : "Unable to publish changes.");
      setSaveState("Unsaved");
    }
  }

  async function unpublish() {
    const nextDraft: EditorDraft = { ...draft, status: "draft", publishedAt: "" };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  }

  async function regenerateCurrentTranslation() {
    if (activeLocale === "zh-CN") {
      setTranslationNotice("Source language does not need regeneration.");
      return;
    }
    setSaveState("Saving");
    try {
      const result = await updatePost(draftToPost(draft, draftTagIds), {
        generateTranslations: true,
        regenerateLocales: [activeLocale],
      });
      const savedDraft = createInitialDraft(result.data, draft.tags);
      setDraft(savedDraft);
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" ") || `${activeLocale} translation regenerated.`);
      setSaveState("Saved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : "Unable to regenerate translation.");
      setSaveState("Unsaved");
    }
  }

  async function applyAiSummary() {
    setSaveState("Saving");
    try {
      const response = await fetch("/api/admin/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.title, content: draft.content }),
      });
      const payload = (await response.json()) as { data?: { summary?: string; tldr?: string; keyTakeaways?: string[]; readingDifficulty?: string } };
      if (!response.ok) throw new Error("AI summary failed.");
      const summary = payload.data?.summary || payload.data?.tldr || draft.excerpt;
      const nextDraft = {
        ...draft,
        excerpt: summary,
        seoDescription: summary,
      };
      setDraft(nextDraft);
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : "AI summary failed.");
      setSaveState("Unsaved");
    }
  }

  async function applyAiTags() {
    setSaveState("Saving");
    try {
      const response = await fetch("/api/admin/ai/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `${draft.title}\n\n${draft.content}` }),
      });
      const payload = (await response.json()) as { data?: { tags?: string[] } };
      if (!response.ok) throw new Error("AI tags failed.");
      const tags = payload.data?.tags ?? [];
      if (tags.length > 0) {
        setDraft((current) => ({ ...current, tags: tags.join(", ") }));
      }
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : "AI tags failed.");
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="h-auto overflow-visible px-margin-mobile pb-6 md:h-[calc(100vh-6rem)] md:overflow-hidden md:px-margin-desktop">
      <section className="mb-6 flex flex-col justify-between gap-4 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-headline-md text-on-surface">{isNew ? "New Editorial Entry" : draft.localizedFields["zh-CN"].title || "Untitled Editorial"}</h1>
          <SaveIndicator status={saveState} />
          <span className="font-mono text-label-mono uppercase tracking-widest text-outline">{readingTime}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AdminButton variant="ghost">
            <Eye aria-hidden size={15} />
            Preview
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => void saveAsDraft()}>
            <Save aria-hidden size={15} />
            Save Draft
          </AdminButton>
          {draft.status === "published" ? (
            <AdminButton variant="ghost" onClick={() => void unpublish()}>
              <RotateCcw aria-hidden size={15} />
              Unpublish
            </AdminButton>
          ) : null}
          <AdminButton variant="primary" onClick={() => void publishNow()}>
            <Send aria-hidden size={15} />
            Publish
          </AdminButton>
        </div>
      </section>
      {saveError || error || translationNotice ? (
        <div className="mb-4 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
          {saveError || error || translationNotice}
        </div>
      ) : null}

      <section className="mb-4 flex flex-col justify-between gap-3 border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Languages aria-hidden className="text-primary" size={16} />
          <div className="inline-flex overflow-hidden rounded-full border border-outline-variant/20 p-1">
            {editorLocales.map((item) => (
              <button
                key={item.locale}
                aria-pressed={activeLocale === item.locale}
                className={cn(
                  "rounded-full px-4 py-2 text-left transition duration-200",
                  activeLocale === item.locale ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-surface",
                )}
                type="button"
                onClick={() => setActiveLocale(item.locale)}
              >
                <span className="block font-mono text-[10px] uppercase tracking-[0.22em]">{item.label}</span>
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>
        {activeLocale !== "zh-CN" ? (
          <AdminButton className="px-4 py-2" variant="ghost" onClick={() => void regenerateCurrentTranslation()}>
            <RotateCcw aria-hidden size={14} />
            Regenerate {activeLocale === "zh-TW" ? "Traditional" : "English"}
          </AdminButton>
        ) : (
          <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Source language</span>
        )}
      </section>

      <section className="grid h-auto grid-cols-1 overflow-hidden border border-outline-variant/10 bg-background md:h-[calc(100%-6rem)] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <aside className="max-h-none overflow-y-auto border-b border-outline-variant/10 bg-surface-container-lowest p-6 lg:max-h-full lg:border-b-0 lg:border-r">
          <div className="space-y-7">
            <h2 className="border-b border-outline-variant/20 pb-2 font-mono text-label-mono uppercase tracking-widest text-primary">Document Settings</h2>
            <AdminTextarea label={`Title - ${activeLocale}`} placeholder="Enter article title..." rows={2} value={activeTitle} onChange={(event) => updateLocalizedField("title", event.target.value)} />
            {activeLocale === "zh-CN" ? (
              <AdminTextarea label="Subtitle" placeholder="Short editorial subtitle..." rows={2} value={draft.subtitle} onChange={(event) => updateDraft("subtitle", event.target.value)} />
            ) : null}
            <AdminTextarea label={`Excerpt - ${activeLocale}`} placeholder="Brief summary for listings..." rows={3} value={activeExcerpt} onChange={(event) => updateLocalizedField("excerpt", event.target.value)} />
            <AdminInput
              label="Slug"
              placeholder="article-url-slug"
              value={draft.slug}
              onChange={(event) => {
                setSlugWasEdited(true);
                updateDraft("slug", slugifyTitle(event.target.value));
              }}
            />
            <label className="block">
              <FieldLabel>Category</FieldLabel>
              <select className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0" value={draft.categoryId} onChange={(event) => updateDraft("categoryId", event.target.value)}>
                {data.categories.map((categoryOption) => (
                  <option key={categoryOption.id} className="bg-surface" value={categoryOption.id}>
                    {categoryOption.name}
                  </option>
                ))}
              </select>
            </label>
            <AdminInput label="Tags" list="cms-tags" placeholder="Studio, Notes, Architecture" value={draft.tags} onChange={(event) => updateDraft("tags", event.target.value)} />
            <datalist id="cms-tags">
              {knownTagNames.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <AdminInput label="Cover Image" placeholder="https://..." value={draft.coverImage} onChange={(event) => updateDraft("coverImage", event.target.value)} />
            <div className="h-32 overflow-hidden border border-dashed border-outline-variant/30 bg-surface">
              <div className="h-full bg-cover bg-center grayscale" style={{ backgroundImage: `url("${draft.coverImage}")` }} />
            </div>
            <label className="block">
              <FieldLabel>Status</FieldLabel>
              <select className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0" value={draft.status} onChange={(event) => updateDraft("status", event.target.value as EditorStatus)}>
                <option className="bg-surface" value="draft">Draft</option>
                <option className="bg-surface" value="published">Published</option>
                <option className="bg-surface" value="scheduled">Scheduled</option>
              </select>
            </label>
            <AdminInput label="Published At" placeholder="2026-07-01T09:00" type="datetime-local" value={draft.publishedAt} onChange={(event) => updateDraft("publishedAt", event.target.value)} />
            <ToggleField checked={draft.featured} hint="Displays in editorial highlights" label="Featured" onChange={(checked) => updateDraft("featured", checked)} />
            <ToggleField checked={draft.pinned} hint="Keeps entry above normal order" label="Pinned" onChange={(checked) => updateDraft("pinned", checked)} />
            <div className="border-t border-outline-variant/10 pt-4">
              <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">SEO Options</h2>
              <div className="space-y-7">
                <AdminInput label={`SEO Title - ${activeLocale}`} placeholder="Leave blank to use title" value={activeSeoTitle} onChange={(event) => updateLocalizedField("seoTitle", event.target.value)} />
                <AdminTextarea label={`SEO Description - ${activeLocale}`} placeholder="Search description..." rows={3} value={activeSeoDescription} onChange={(event) => updateLocalizedField("seoDescription", event.target.value)} />
              </div>
            </div>
            {activeLocale !== "zh-CN" ? (
              <div className="border-t border-outline-variant/10 pt-4">
                <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">Translation Locks</h2>
                <div className="space-y-2">
                  {translationFieldLabels.map((item) => {
                    const locked = Boolean(draft.translationLocks[activeLocale]?.[item.field]);
                    return (
                      <button
                        key={item.field}
                        className={cn(
                          "flex w-full items-center justify-between border border-outline-variant/15 px-3 py-2 text-left transition",
                          locked ? "bg-surface-container text-on-surface" : "text-on-surface-variant hover:border-outline-variant/40 hover:text-on-surface",
                        )}
                        type="button"
                        onClick={() => toggleTranslationLock(activeLocale, item.field)}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">{item.label}</span>
                        {locked ? <Lock aria-hidden size={14} /> : <Unlock aria-hidden size={14} />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Locked fields are safe from AI regeneration.
                </p>
              </div>
            ) : null}
            <div className="border-t border-outline-variant/10 pt-4">
              <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">AI Tools</h2>
              <div className="grid gap-3">
                <AdminButton variant="ghost" onClick={() => void applyAiSummary()}>
                  Generate Summary
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => void applyAiTags()}>
                  Generate Tags
                </AdminButton>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col bg-background md:min-h-0">
          <div className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-outline-variant/10 bg-surface-container-lowest/50 px-6 text-on-surface-variant">
            {toolbarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  className={`p-1 transition hover:text-primary ${index === 3 || index === 5 ? "ml-3 border-l border-outline-variant/20 pl-4" : ""}`}
                  type="button"
                >
                  <Icon aria-hidden size={18} strokeWidth={1.6} />
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto py-10 md:py-14">
            <div className="mx-auto w-full max-w-3xl px-6 md:px-8">
              <label className="mb-4 flex items-center justify-between">
                <span className="label-mono">Markdown / MDX</span>
                <span className="font-mono text-label-mono uppercase tracking-widest text-outline">Words: {wordCount}</span>
              </label>
              <textarea
                className="min-h-[62vh] w-full resize-none border-0 bg-transparent font-body text-[18px] leading-8 text-on-surface outline-none focus:ring-0 placeholder:text-on-surface-variant/50"
                spellCheck
                value={activeContent}
                onChange={(event) => updateLocalizedField("content", event.target.value)}
              />
            </div>
          </div>
          <div className="flex h-10 shrink-0 items-center justify-between border-t border-outline-variant/10 bg-surface-container-lowest px-6">
            <div className="flex gap-4">
              <span className="font-mono text-label-mono text-outline">Words: {wordCount}</span>
              <span className="font-mono text-label-mono text-outline">Reading time: {readingTime}</span>
            </div>
            <span className="hidden font-mono text-label-mono text-outline sm:block">Markdown / MDX Supported</span>
          </div>
        </section>

        <aside className="max-h-none overflow-y-auto border-t border-outline-variant/10 bg-surface-container-low xl:max-h-full xl:border-l xl:border-t-0">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/90 p-4 backdrop-blur-md">
            <span className="font-mono text-label-mono uppercase tracking-widest text-primary">Live Preview</span>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-full border border-outline-variant/20 p-1">
                {editorLocales.map((item) => (
                  <button
                    key={item.locale}
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] transition",
                      activeLocale === item.locale ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-surface",
                    )}
                    type="button"
                    onClick={() => setActiveLocale(item.locale)}
                  >
                    {item.shortLabel}
                  </button>
                ))}
              </div>
              <StatusBadge status={draft.status} />
              {saveState === "Saved" ? <Check aria-hidden className="text-primary" size={16} /> : <CalendarClock aria-hidden className="text-secondary" size={16} />}
            </div>
          </div>
          <article className="pb-20">
            <header className="px-6 pb-10 pt-10 md:px-8">
              <p className="mb-5 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                Journal - {category.name}
              </p>
              <h2 className="mb-6 font-serif text-display-lg leading-tight text-on-background">{previewSource.title || "Untitled Editorial"}</h2>
              <p className="mb-6 text-body-lg italic text-on-surface-variant">{previewSource.excerpt}</p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                <span>Noah. Studio</span>
                <span className="size-1 rounded-full bg-outline-variant" />
                <span>{draft.publishedAt || "Unscheduled"}</span>
                <span className="size-1 rounded-full bg-outline-variant" />
                <span>{previewReadingTime}</span>
              </div>
            </header>
            <div className="relative mb-10 h-72 overflow-hidden bg-surface-container-low">
              <div className="h-full w-full bg-cover bg-center grayscale" style={{ backgroundImage: `url("${draft.coverImage}")` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
            </div>
            <div className="px-6 md:px-8">
              {tagList.length > 0 ? (
                <div className="mb-10 flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <span key={tag} className="rounded-full border border-outline-variant/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="max-w-none">
                {previewBlocks.map((block, index) => (
                  <PreviewBlock key={`${block.type}-${index}`} block={block} />
                ))}
              </div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
