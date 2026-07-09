"use client";

/* eslint-disable @next/next/no-img-element */

import {
  CalendarClock,
  Check,
  Code,
  Copy,
  Eye,
  ExternalLink,
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
  Trash2,
  Type,
  Unlock,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import StatusBadge from "@/components/admin/StatusBadge";
import TagMultiSelect from "@/components/admin/TagMultiSelect";
import { resolveBrandContent } from "@/components/brand/brandContent";
import { createEmptyPost, getCategoryById, type Post, type Tag, type TranslationField, type TranslationLocks } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import type { Locale } from "@/i18n/config";
import type { LocalizedTextMap } from "@/i18n/content";
import { useAdminI18n } from "@/i18n/admin";
import { getReadingMinutes, getWordCount, parseMarkdownBlocks, slugifyTitle, type MarkdownBlock } from "@/lib/editor";
import { applyMarkdownCommand, type MarkdownCommand } from "@/lib/markdownEditor";
import { cn } from "@/lib/utils";
import { localeToSegment } from "@/i18n/config";

type PostEditorScreenProps = {
  postId?: string;
};

type EditorStatus = "draft" | "published" | "scheduled" | "archived";
type SaveState = "Unsaved" | "Saving" | "Saved";
type PublishState = "idle" | "publishing" | "published";
type EditorLocale = Locale;
type LocalizedEditorFields = Record<Locale, Record<TranslationField, string>>;

type EditorDraft = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  categoryId: string;
  tags: string[];
  coverImage: string;
  coverDisplayMode: "cover" | "contain" | "original";
  coverFocalX: number;
  coverFocalY: number;
  coverWidth: number | null;
  coverHeight: number | null;
  coverAspectRatio: number | null;
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

type ImageInsertMode = "inline" | "fullWidth" | "figure";

const editorLocales: Array<{ locale: EditorLocale; shortLabel: string; label: string }> = [
  { locale: "zh-CN", shortLabel: "简", label: "简体中文" },
  { locale: "zh-TW", shortLabel: "繁", label: "繁體中文" },
  { locale: "en-US", shortLabel: "EN", label: "English" },
];

const toolbarItems: Array<{ command: MarkdownCommand; icon: typeof Heading1; divider?: boolean }> = [
  { command: "h1", icon: Heading1 },
  { command: "h2", icon: Heading2 },
  { command: "paragraph", icon: Type },
  { command: "italic", icon: Italic, divider: true },
  { command: "quote", icon: Quote },
  { command: "link", icon: LinkIcon, divider: true },
  { command: "image", icon: ImageIcon },
  { command: "code", icon: Code },
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

function createInitialDraft(post?: Post, tagIds?: string[]): EditorDraft {
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
    tags: tagIds ?? emptyPost.tagIds,
    coverImage: emptyPost.coverImage.src,
    coverDisplayMode: emptyPost.coverDisplayMode,
    coverFocalX: emptyPost.coverFocalX,
    coverFocalY: emptyPost.coverFocalY,
    coverWidth: emptyPost.coverImage.width ?? null,
    coverHeight: emptyPost.coverImage.height ?? null,
    coverAspectRatio: emptyPost.coverImage.aspectRatio ?? null,
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

function draftToPost(draft: EditorDraft): Post {
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
    tagIds: draft.tags,
    coverImage: {
      src: draft.coverImage,
      alt: draft.coverImage ? `${fallbackTitle} cover image.` : "",
      displayMode: draft.coverDisplayMode,
      focalX: draft.coverFocalX,
      focalY: draft.coverFocalY,
      width: draft.coverWidth,
      height: draft.coverHeight,
      aspectRatio: draft.coverAspectRatio,
    },
    coverDisplayMode: draft.coverDisplayMode,
    coverFocalX: draft.coverFocalX,
    coverFocalY: draft.coverFocalY,
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
      <figure className={cn("my-12 overflow-hidden bg-surface-container-low", block.layout === "full-width" ? "md:-mx-8" : "")}>
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

function readImageMetrics(file: File) {
  return new Promise<{ width: number; height: number; aspectRatio: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height, aspectRatio: height > 0 ? Number((width / height).toFixed(4)) : 0 });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read cover image dimensions."));
    };
    image.src = url;
  });
}

function postImageFolder(now = new Date()) {
  return `posts/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function safeMarkdownAlt(value: string) {
  return value.replace(/[\[\]\n\r]/g, " ").trim() || "image";
}

export default function PostEditorScreen({ postId }: PostEditorScreenProps) {
  const { data, isReady, updatePost, addTag, uploadAsset, error } = useCmsData();
  const { dictionary, locale } = useAdminI18n();
  const brand = resolveBrandContent(data.siteSettings.brandJson, locale);
  const post = data.posts.find((item) => item.id === postId);
  const isNew = !postId;
  const [draft, setDraft] = useState<EditorDraft>(() => createInitialDraft(post));
  const [saveState, setSaveState] = useState<SaveState>("Saved");
  const [saveError, setSaveError] = useState("");
  const [translationNotice, setTranslationNotice] = useState("");
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [publishedInfo, setPublishedInfo] = useState<{ title: string; publishedAt: string; url: string } | null>(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageInsertMode, setImageInsertMode] = useState<ImageInsertMode>("inline");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [activeLocale, setActiveLocale] = useState<EditorLocale>("zh-CN");
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(postId));
  const [hydrated, setHydrated] = useState(false);
  const initializedKeyRef = useRef("");
  const lastSavedRef = useRef("");
  const autoSaveTimerRef = useRef<number | null>(null);
  const savingTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const editorCopy = dictionary.editor;
  const localeCopy = useMemo(
    () =>
      locale === "zh-CN"
        ? {
          translationSourceHint: "源文本",
          translationTwHint: "自动繁体",
          translationEnHint: "自动英文",
          regenerateCurrent: (value: EditorLocale) => `重新生成${value === "zh-TW" ? "繁体" : "英文"}版本`,
          sourceNoRegen: "源语言无需重新生成。",
          regenerated: (value: EditorLocale) => `${value === "zh-TW" ? "繁体" : "英文"}版本已重新生成。`,
          regenerateFailed: "重新生成翻译失败。",
          saveFailed: "无法保存更改。",
          publishFailed: "无法发布更改。",
          aiSummaryFailed: "AI 摘要生成失败。",
          aiTagsFailed: "AI 标签生成失败。",
          titlePlaceholder: "输入文章标题...",
          subtitlePlaceholder: "输入编辑型副标题...",
          excerptPlaceholder: "输入用于列表与推荐的摘要...",
          slugPlaceholder: "article-url-slug",
          tagsPlaceholder: "建筑, 写作, 影像",
          coverPlaceholder: "https://...",
          publishAtPlaceholder: "2026-07-01T09:00",
          featuredHint: "显示在首页与编辑精选中",
          pinnedHint: "固定在普通排序之前",
          seoTitlePlaceholder: "留空则默认使用标题",
          seoDescriptionPlaceholder: "输入搜索摘要...",
          translationLocks: "翻译锁定",
          translationLocksHint: "繁体中文由简体自动生成；英文由 AI 自动生成。解锁后为 Manual Override，保存简体时不会覆盖人工内容。",
          autoTranslation: "Auto Translation",
          manualOverride: "Manual Override",
          restoreAutoSync: "恢复自动同步",
          uploadCover: "上传封面",
          replaceCover: "替换封面",
          deleteCover: "删除封面",
          coverDisplayMode: "Cover Display Mode",
          coverFocalPoint: "焦点位置",
          coverUploadFailed: "封面上传失败。",
          imageUpload: "上传图片",
          imageUploadFailed: "图片上传失败。",
          imageAlt: "Alt 文案",
          imageCaption: "Caption",
          imageInsertMode: "插入方式",
          imageInline: "Inline Image",
          imageFullWidth: "Full-width Image",
          imageFigure: "Figure With Caption",
          chooseImage: "选择图片",
          insertImage: "上传并插入",
          cancel: "取消",
          publishing: "Publishing...",
          publishedDone: "Published ✓",
          publishedSuccessfully: "Article Published Successfully",
          viewArticle: "查看文章",
          copyPublishedLink: "复制链接",
          continueEditing: "继续编辑",
          googleCrawlable: "Google 已可抓取",
          aiTools: "AI 工具",
          generateSummary: "生成摘要",
          generateTags: "生成标签",
        }
        : locale === "zh-TW"
          ? {
            translationSourceHint: "源文本",
            translationTwHint: "自動繁體",
            translationEnHint: "自動英文",
            regenerateCurrent: (value: EditorLocale) => `重新生成${value === "zh-TW" ? "繁體" : "英文"}版本`,
            sourceNoRegen: "源語言無需重新生成。",
            regenerated: (value: EditorLocale) => `${value === "zh-TW" ? "繁體" : "英文"}版本已重新生成。`,
            regenerateFailed: "重新生成翻譯失敗。",
            saveFailed: "無法儲存變更。",
            publishFailed: "無法發布變更。",
            aiSummaryFailed: "AI 摘要生成失敗。",
            aiTagsFailed: "AI 標籤生成失敗。",
            titlePlaceholder: "輸入文章標題...",
            subtitlePlaceholder: "輸入編輯型副標題...",
            excerptPlaceholder: "輸入用於列表與推薦的摘要...",
            slugPlaceholder: "article-url-slug",
            tagsPlaceholder: "建築, 寫作, 影像",
            coverPlaceholder: "https://...",
            publishAtPlaceholder: "2026-07-01T09:00",
            featuredHint: "顯示在首頁與編輯精選中",
            pinnedHint: "固定在一般排序之前",
            seoTitlePlaceholder: "留空則預設使用標題",
            seoDescriptionPlaceholder: "輸入搜尋摘要...",
            translationLocks: "翻譯鎖定",
            translationLocksHint: "繁體中文由簡體自動生成；英文由 AI 自動生成。解鎖後為 Manual Override，儲存簡體時不會覆蓋人工內容。",
            autoTranslation: "Auto Translation",
            manualOverride: "Manual Override",
            restoreAutoSync: "恢復自動同步",
            uploadCover: "上傳封面",
            replaceCover: "替換封面",
            deleteCover: "刪除封面",
            coverDisplayMode: "Cover Display Mode",
            coverFocalPoint: "焦點位置",
            coverUploadFailed: "封面上傳失敗。",
            imageUpload: "上傳圖片",
            imageUploadFailed: "圖片上傳失敗。",
            imageAlt: "Alt 文案",
            imageCaption: "Caption",
            imageInsertMode: "插入方式",
            imageInline: "Inline Image",
            imageFullWidth: "Full-width Image",
            imageFigure: "Figure With Caption",
            chooseImage: "選擇圖片",
            insertImage: "上傳並插入",
            cancel: "取消",
            publishing: "Publishing...",
            publishedDone: "Published ✓",
            publishedSuccessfully: "Article Published Successfully",
            viewArticle: "查看文章",
            copyPublishedLink: "複製連結",
            continueEditing: "繼續編輯",
            googleCrawlable: "Google 已可抓取",
            aiTools: "AI 工具",
            generateSummary: "生成摘要",
            generateTags: "生成標籤",
          }
          : {
            translationSourceHint: "Source",
            translationTwHint: "Traditional",
            translationEnHint: "English",
            regenerateCurrent: (value: EditorLocale) => `Regenerate ${value === "zh-TW" ? "Traditional" : "English"}`,
            sourceNoRegen: "Source language does not need regeneration.",
            regenerated: (value: EditorLocale) => `${value} translation regenerated.`,
            regenerateFailed: "Unable to regenerate translation.",
            saveFailed: "Unable to save changes.",
            publishFailed: "Unable to publish changes.",
            aiSummaryFailed: "AI summary failed.",
            aiTagsFailed: "AI tags failed.",
            titlePlaceholder: "Enter article title...",
            subtitlePlaceholder: "Short editorial subtitle...",
            excerptPlaceholder: "Brief summary for listings...",
            slugPlaceholder: "article-url-slug",
            tagsPlaceholder: "Studio, Notes, Architecture",
            coverPlaceholder: "https://...",
            publishAtPlaceholder: "2026-07-01T09:00",
            featuredHint: "Displays in editorial highlights",
            pinnedHint: "Keeps entry above normal order",
            seoTitlePlaceholder: "Leave blank to use title",
            seoDescriptionPlaceholder: "Search description...",
            translationLocks: "Translation Locks",
            translationLocksHint: "Traditional Chinese is generated from Simplified Chinese. English is generated by AI. Unlocking a field creates a Manual Override that source saves will preserve.",
            autoTranslation: "Auto Translation",
            manualOverride: "Manual Override",
            restoreAutoSync: "Restore Auto Sync",
            uploadCover: "Upload Cover",
            replaceCover: "Replace Cover",
            deleteCover: "Delete Cover",
            coverDisplayMode: "Cover Display Mode",
            coverFocalPoint: "Focal Point",
            coverUploadFailed: "Cover upload failed.",
            imageUpload: "Upload Image",
            imageUploadFailed: "Image upload failed.",
            imageAlt: "Alt Text",
            imageCaption: "Caption",
            imageInsertMode: "Insert Mode",
            imageInline: "Inline Image",
            imageFullWidth: "Full-width Image",
            imageFigure: "Figure With Caption",
            chooseImage: "Choose Image",
            insertImage: "Upload And Insert",
            cancel: "Cancel",
            publishing: "Publishing...",
            publishedDone: "Published ✓",
            publishedSuccessfully: "Article Published Successfully",
            viewArticle: "View Article",
            copyPublishedLink: "Copy Link",
            continueEditing: "Continue Editing",
            googleCrawlable: "Google can crawl",
            aiTools: "AI Tools",
            generateSummary: "Generate Summary",
            generateTags: "Generate Tags",
          },
    [locale],
  );
  const translationFieldLabels = useMemo<Array<{ field: TranslationField; label: string }>>(
    () => [
      { field: "title", label: editorCopy.title },
      { field: "excerpt", label: editorCopy.excerpt },
      { field: "content", label: editorCopy.markdownMdx },
      { field: "seoTitle", label: editorCopy.seoTitle },
      { field: "seoDescription", label: editorCopy.seoDescription },
    ],
    [editorCopy],
  );

  const activeFields = draft.localizedFields[activeLocale];
  const activeTitle = activeFields.title || (activeLocale === "zh-CN" ? draft.title : "");
  const activeExcerpt = activeFields.excerpt || (activeLocale === "zh-CN" ? draft.excerpt : "");
  const activeContent = activeFields.content || (activeLocale === "zh-CN" ? draft.content : "");
  const activeSeoTitle = activeFields.seoTitle || (activeLocale === "zh-CN" ? draft.seoTitle : "");
  const activeSeoDescription = activeFields.seoDescription || (activeLocale === "zh-CN" ? draft.seoDescription : "");
  const wordCount = useMemo(() => getWordCount(activeContent), [activeContent]);
  const readingMinutes = useMemo(() => getReadingMinutes(activeContent), [activeContent]);
  const readingTime = useMemo(() => editorCopy.minRead(readingMinutes), [editorCopy, readingMinutes]);
  const tagList = useMemo(
    () =>
      draft.tags
        .map((tagId) => data.tags.find((tag) => tag.id === tagId || tag.slug === tagId)?.name ?? tagId)
        .filter(Boolean),
    [data.tags, draft.tags],
  );

  const category = getCategoryById(data, draft.categoryId);
  const brandText = brand.logoText || brand.brandName;
  const previewSource = {
    title: activeTitle || draft.title,
    excerpt: activeExcerpt || draft.subtitle || draft.excerpt || editorCopy.newStudioNote,
    content: activeContent || draft.content,
  };
  const previewBlocks = useMemo(() => parseMarkdownBlocks(previewSource.content), [previewSource.content]);
  const previewReadingMinutes = useMemo(() => getReadingMinutes(previewSource.content), [previewSource.content]);
  const previewReadingTime = useMemo(() => editorCopy.minRead(previewReadingMinutes), [editorCopy, previewReadingMinutes]);
  const coverObjectFit = draft.coverDisplayMode === "cover" ? "cover" : "contain";
  const coverObjectPosition = `${draft.coverFocalX}% ${draft.coverFocalY}%`;

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const key = postId ?? "new";
    if (initializedKeyRef.current === key) {
      return;
    }
    const nextDraft = createInitialDraft(post, post?.tagIds ?? []);
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
            const result = await updatePost(draftToPost(draft));
            lastSavedRef.current = serialized;
            setSaveError("");
            setTranslationNotice(result.warnings.join(" "));
            setSaveState("Saved");
          } catch (requestError) {
            setSaveError(requestError instanceof Error ? requestError.message : localeCopy.saveFailed);
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
  }, [draft, hydrated, localeCopy.saveFailed, updatePost]);

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

  function localizedSaveState(state: SaveState) {
    if (state === "Saved") return editorCopy.saved;
    if (state === "Saving") return editorCopy.saving;
    return editorCopy.unsaved;
  }

  function handleToolbarCommand(command: MarkdownCommand) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    if (command === "image") {
      setIsImageDialogOpen(true);
      return;
    }

    const result = applyMarkdownCommand(textarea.value, { start: textarea.selectionStart, end: textarea.selectionEnd }, command);
    textarea.focus();
    textarea.setSelectionRange(result.replacementStart, result.replacementEnd);
    const inserted = document.execCommand("insertText", false, result.replacement);
    if (!inserted) {
      textarea.setRangeText(result.replacement, result.replacementStart, result.replacementEnd, "select");
    }
    textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    updateLocalizedField("content", textarea.value);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  async function createEditorTag(name: string): Promise<Tag> {
    const trimmedName = name.trim();
    const existing = data.tags.find((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase() || tag.slug === slugifyTitle(trimmedName));
    if (existing) {
      return existing;
    }

    return await addTag({
      id: slugifyTitle(trimmedName),
      name: trimmedName,
      slug: slugifyTitle(trimmedName),
    });
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

  function restoreAutoSync(locale: EditorLocale) {
    if (locale === "zh-CN") {
      return;
    }
    setDraft((current) => ({
      ...current,
      translationLocks: {
        ...current.translationLocks,
        [locale]: {},
      },
    }));
    setSaveState("Unsaved");
  }

  async function handleCoverUpload(file: File) {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    if (!allowedTypes.has(file.type) || file.size > 20 * 1024 * 1024) {
      setSaveError(localeCopy.coverUploadFailed);
      return;
    }

    setIsCoverUploading(true);
    setSaveState("Saving");
    try {
      const [uploaded, metrics] = await Promise.all([uploadAsset(file, "covers"), readImageMetrics(file)]);
      setDraft((current) => ({
        ...current,
        coverImage: uploaded.url,
        coverWidth: metrics.width,
        coverHeight: metrics.height,
        coverAspectRatio: metrics.aspectRatio,
      }));
      setSaveError("");
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.coverUploadFailed);
      setSaveState("Unsaved");
    } finally {
      setIsCoverUploading(false);
    }
  }

  function insertMarkdownAtCursor(markdown: string) {
    const textarea = textareaRef.current;
    const value = textarea?.value ?? activeContent;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
    const insertion = `${prefix}${markdown}${suffix}`;
    const nextValue = `${before}${insertion}${after}`;
    const cursor = before.length + insertion.length;

    updateLocalizedField("content", nextValue);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function markdownForUploadedImage(url: string) {
    const alt = safeMarkdownAlt(imageAltText);
    if (imageInsertMode === "figure" && imageCaption.trim()) {
      return `![${alt}](${url})\n\n_${imageCaption.trim()}_`;
    }
    if (imageInsertMode === "fullWidth") {
      return `![${alt}](${url} "full-width")`;
    }
    return `![${alt}](${url})`;
  }

  async function handlePostImageUpload() {
    const file = imageUploadFile;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    if (!file || !allowedTypes.has(file.type) || file.size > 20 * 1024 * 1024) {
      setSaveError(localeCopy.imageUploadFailed);
      return;
    }

    setIsImageUploading(true);
    setSaveState("Saving");
    try {
      const uploaded = await uploadAsset(file, postImageFolder());
      insertMarkdownAtCursor(markdownForUploadedImage(uploaded.url));
      setImageUploadFile(null);
      setImageAltText("");
      setImageCaption("");
      setImageInsertMode("inline");
      setIsImageDialogOpen(false);
      setSaveError("");
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.imageUploadFailed);
      setSaveState("Unsaved");
    } finally {
      setIsImageUploading(false);
    }
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
      const result = await updatePost(draftToPost(nextDraft), { generateTranslations });
      const savedDraft = generateTranslations ? createInitialDraft(result.data, result.data.tagIds.length ? result.data.tagIds : nextDraft.tags) : nextDraft;
      if (generateTranslations) {
        setDraft(savedDraft);
      }
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" "));
      setSaveState("Saved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.saveFailed);
      setSaveState("Unsaved");
    }
  }

  async function saveAsDraft() {
    const nextDraft: EditorDraft = { ...draft, status: "draft", publishedAt: "" };
    setDraft(nextDraft);
    await persistDraft(nextDraft, true);
  }

  async function publishNow() {
    if (publishState === "publishing") {
      return;
    }

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
    setPublishState("publishing");
    try {
      const result = await updatePost(draftToPost(nextDraft), { generateTranslations: true });
      const savedDraft = createInitialDraft(result.data, result.data.tagIds.length ? result.data.tagIds : nextDraft.tags);
      setDraft(savedDraft);
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" "));
      setSaveState("Saved");
      const segment = localeToSegment(locale);
      const url = `https://journal.lewislee.online/${segment}/journal/${savedDraft.slug}`;
      setPublishedInfo({ title: savedDraft.title || editorCopy.untitledEditorial, publishedAt: savedDraft.publishedAt, url });
      setPublishState("published");
      window.setTimeout(() => setPublishState("idle"), 5000);
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.publishFailed);
      setSaveState("Unsaved");
      setPublishState("idle");
    }
  }

  useEffect(() => {
    function publishFromTopbar() {
      void publishNow();
    }

    window.addEventListener("admin:publish-current-post", publishFromTopbar);
    return () => {
      window.removeEventListener("admin:publish-current-post", publishFromTopbar);
    };
  });

  async function unpublish() {
    const nextDraft: EditorDraft = { ...draft, status: "draft", publishedAt: "" };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  }

  async function regenerateCurrentTranslation() {
    if (activeLocale === "zh-CN") {
      setTranslationNotice(localeCopy.sourceNoRegen);
      return;
    }
    setSaveState("Saving");
    try {
      const result = await updatePost(draftToPost(draft), {
        generateTranslations: true,
        regenerateLocales: [activeLocale],
      });
      const savedDraft = createInitialDraft(result.data, result.data.tagIds.length ? result.data.tagIds : draft.tags);
      setDraft(savedDraft);
      lastSavedRef.current = JSON.stringify(savedDraft);
      setSaveError("");
      setTranslationNotice(result.warnings.join(" ") || localeCopy.regenerated(activeLocale));
      setSaveState("Saved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.regenerateFailed);
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
      if (!response.ok) throw new Error(localeCopy.aiSummaryFailed);
      const summary = payload.data?.summary || payload.data?.tldr || draft.excerpt;
      const nextDraft = {
        ...draft,
        excerpt: summary,
        seoDescription: summary,
      };
      setDraft(nextDraft);
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.aiSummaryFailed);
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
      if (!response.ok) throw new Error(localeCopy.aiTagsFailed);
      const tags = payload.data?.tags ?? [];
      if (tags.length > 0) {
        const createdTags = await Promise.all(tags.map((tag) => createEditorTag(tag)));
        setDraft((current) => ({
          ...current,
          tags: [...new Set([...current.tags, ...createdTags.map((tag) => tag.id)])],
        }));
      }
      setSaveState("Unsaved");
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : localeCopy.aiTagsFailed);
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="h-auto overflow-visible px-margin-mobile pb-6 md:px-margin-desktop xl:h-[calc(100vh-6rem)] xl:overflow-hidden">
      <input
        ref={coverInputRef}
        accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) void handleCoverUpload(file);
        }}
      />
      <input
        ref={imageInputRef}
        accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.currentTarget.value = "";
          setImageUploadFile(file);
          if (file && !imageAltText) {
            setImageAltText(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
          }
        }}
      />
      {isImageDialogOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-background/70 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto border border-outline-variant/20 bg-surface-container-low p-5 shadow-2xl md:p-6">
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <h2 className="font-serif text-headline-md text-on-surface">{localeCopy.imageUpload}</h2>
                <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">JPG / PNG / WEBP / AVIF · 20MB</p>
              </div>
              <button className="text-on-surface-variant transition hover:text-on-surface" type="button" onClick={() => setIsImageDialogOpen(false)}>
                ×
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <span className="label-mono mb-3 block">{localeCopy.chooseImage}</span>
                <button
                  className="flex w-full items-center justify-between border border-dashed border-outline-variant/30 px-4 py-4 text-left text-body-md text-on-surface-variant transition hover:border-outline-variant/50 hover:text-on-surface"
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <span>{imageUploadFile ? imageUploadFile.name : localeCopy.chooseImage}</span>
                  <Upload aria-hidden size={16} />
                </button>
              </div>
              <AdminInput label={localeCopy.imageAlt} value={imageAltText} onChange={(event) => setImageAltText(event.target.value)} />
              <AdminInput label={localeCopy.imageCaption} value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} />
              <div>
                <span className="label-mono mb-3 block">{localeCopy.imageInsertMode}</span>
                <div className="grid gap-2 md:grid-cols-3">
                  {([
                    ["inline", localeCopy.imageInline],
                    ["fullWidth", localeCopy.imageFullWidth],
                    ["figure", localeCopy.imageFigure],
                  ] as Array<[ImageInsertMode, string]>).map(([mode, label]) => (
                    <button
                      key={mode}
                      className="border border-outline-variant/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant transition data-[active=true]:bg-on-surface data-[active=true]:text-background"
                      data-active={imageInsertMode === mode}
                      type="button"
                      onClick={() => setImageInsertMode(mode)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <AdminButton variant="ghost" onClick={() => setIsImageDialogOpen(false)}>
                  {localeCopy.cancel}
                </AdminButton>
                <AdminButton disabled={!imageUploadFile || isImageUploading} variant="primary" onClick={() => void handlePostImageUpload()}>
                  {isImageUploading ? localeCopy.imageUpload : localeCopy.insertImage}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <section className="mb-6 flex flex-col justify-between gap-4 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-headline-md text-on-surface">{isNew ? editorCopy.newEditorialEntry : draft.localizedFields["zh-CN"].title || editorCopy.untitledEditorial}</h1>
          <SaveIndicator status={localizedSaveState(saveState)} />
          <span className="font-mono text-label-mono uppercase tracking-widest text-outline">{readingTime}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AdminButton variant="ghost">
            <Eye aria-hidden size={15} />
            {editorCopy.preview}
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => void saveAsDraft()}>
            <Save aria-hidden size={15} />
            {editorCopy.saveDraft}
          </AdminButton>
          {draft.status === "published" ? (
            <AdminButton variant="ghost" onClick={() => void unpublish()}>
              <RotateCcw aria-hidden size={15} />
              {editorCopy.unpublish}
            </AdminButton>
          ) : null}
          <AdminButton disabled={publishState === "publishing"} variant="primary" onClick={() => void publishNow()}>
            <Send aria-hidden size={15} />
            {publishState === "publishing" ? localeCopy.publishing : publishState === "published" ? localeCopy.publishedDone : editorCopy.publish}
          </AdminButton>
        </div>
      </section>
      {publishedInfo ? (
        <div className="mb-4 border border-primary/30 bg-primary/10 px-5 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-label-mono uppercase tracking-widest text-primary">✓ {localeCopy.publishedSuccessfully}</p>
              <p className="mt-2 font-serif text-headline-md text-on-surface">{publishedInfo.title}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {publishedInfo.publishedAt} · {localeCopy.googleCrawlable}: {publishedInfo.url}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AdminButton variant="ghost" onClick={() => window.open(publishedInfo.url, "_blank", "noopener,noreferrer")}>
                <ExternalLink aria-hidden size={14} />
                {localeCopy.viewArticle}
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => void navigator.clipboard?.writeText(publishedInfo.url)}>
                <Copy aria-hidden size={14} />
                {localeCopy.copyPublishedLink}
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setPublishedInfo(null)}>
                {localeCopy.continueEditing}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
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
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
                  {item.locale === "zh-CN" ? localeCopy.translationSourceHint : item.locale === "zh-TW" ? localeCopy.translationTwHint : localeCopy.translationEnHint}
                </span>
              </button>
            ))}
          </div>
        </div>
        {activeLocale !== "zh-CN" ? (
          <AdminButton className="px-4 py-2" variant="ghost" onClick={() => void regenerateCurrentTranslation()}>
            <RotateCcw aria-hidden size={14} />
            {localeCopy.regenerateCurrent(activeLocale)}
          </AdminButton>
        ) : (
          <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{editorCopy.sourceLanguage}</span>
        )}
      </section>

      <section className="grid h-auto grid-cols-1 overflow-hidden border border-outline-variant/10 bg-background lg:grid-cols-[300px_minmax(0,1fr)] xl:h-[calc(100%-6rem)] xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <aside className="max-h-none overflow-y-auto border-b border-outline-variant/10 bg-surface-container-lowest p-6 lg:max-h-full lg:border-b-0 lg:border-r">
          <div className="space-y-7">
            <h2 className="border-b border-outline-variant/20 pb-2 font-mono text-label-mono uppercase tracking-widest text-primary">{editorCopy.documentSettings}</h2>
            <AdminTextarea label={`${editorCopy.title} - ${activeLocale}`} placeholder={localeCopy.titlePlaceholder} rows={2} value={activeTitle} onChange={(event) => updateLocalizedField("title", event.target.value)} />
            {activeLocale === "zh-CN" ? (
              <AdminTextarea label={editorCopy.subtitle} placeholder={localeCopy.subtitlePlaceholder} rows={2} value={draft.subtitle} onChange={(event) => updateDraft("subtitle", event.target.value)} />
            ) : null}
            <AdminTextarea label={`${editorCopy.excerpt} - ${activeLocale}`} placeholder={localeCopy.excerptPlaceholder} rows={3} value={activeExcerpt} onChange={(event) => updateLocalizedField("excerpt", event.target.value)} />
            <AdminInput
              label={editorCopy.slug}
              placeholder={localeCopy.slugPlaceholder}
              value={draft.slug}
              onChange={(event) => {
                setSlugWasEdited(true);
                updateDraft("slug", slugifyTitle(event.target.value));
              }}
            />
            <label className="block">
              <FieldLabel>{editorCopy.category}</FieldLabel>
              <select className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0" value={draft.categoryId} onChange={(event) => updateDraft("categoryId", event.target.value)}>
                {data.categories.map((categoryOption) => (
                  <option key={categoryOption.id} className="bg-surface" value={categoryOption.id}>
                    {categoryOption.name}
                  </option>
                ))}
              </select>
            </label>
            <TagMultiSelect
              label={editorCopy.tags}
              placeholder={localeCopy.tagsPlaceholder}
              selectedIds={draft.tags}
              tags={data.tags}
              onChange={(tagIds) => updateDraft("tags", tagIds)}
              onCreateTag={createEditorTag}
            />
            <div className="space-y-4 border-t border-outline-variant/10 pt-4">
              <AdminInput label={editorCopy.coverImage} placeholder={localeCopy.coverPlaceholder} value={draft.coverImage} onChange={(event) => updateDraft("coverImage", event.target.value)} />
              <div className="flex flex-wrap gap-2">
                <AdminButton className="px-3 py-2" variant="ghost" onClick={() => coverInputRef.current?.click()}>
                  <Upload aria-hidden size={14} />
                  {draft.coverImage ? localeCopy.replaceCover : localeCopy.uploadCover}
                </AdminButton>
                {draft.coverImage ? (
                  <AdminButton className="px-3 py-2" variant="ghost" onClick={() => {
                    updateDraft("coverImage", "");
                    updateDraft("coverWidth", null);
                    updateDraft("coverHeight", null);
                    updateDraft("coverAspectRatio", null);
                  }}>
                    <Trash2 aria-hidden size={14} />
                    {localeCopy.deleteCover}
                  </AdminButton>
                ) : null}
              </div>
              <label className="block">
                <FieldLabel>{localeCopy.coverDisplayMode}</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {(["cover", "contain", "original"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={cn("border border-outline-variant/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest", draft.coverDisplayMode === mode ? "bg-primary text-background" : "text-on-surface-variant")}
                      type="button"
                      onClick={() => updateDraft("coverDisplayMode", mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </label>
              <div>
                <FieldLabel>{localeCopy.coverFocalPoint}</FieldLabel>
                <div className="grid gap-3">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    X {draft.coverFocalX}%
                    <input className="mt-2 w-full accent-primary" max={100} min={0} type="range" value={draft.coverFocalX} onChange={(event) => updateDraft("coverFocalX", Number(event.target.value))} />
                  </label>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Y {draft.coverFocalY}%
                    <input className="mt-2 w-full accent-primary" max={100} min={0} type="range" value={draft.coverFocalY} onChange={(event) => updateDraft("coverFocalY", Number(event.target.value))} />
                  </label>
                </div>
              </div>
              <div className="h-32 overflow-hidden border border-dashed border-outline-variant/30 bg-surface">
                {draft.coverImage ? (
                  <img alt="" className="h-full w-full grayscale" src={draft.coverImage} style={{ objectFit: coverObjectFit, objectPosition: coverObjectPosition }} />
                ) : null}
              </div>
              {isCoverUploading ? <p className="label-mono text-primary">{localeCopy.uploadCover}</p> : null}
              {draft.coverWidth && draft.coverHeight ? (
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {draft.coverWidth} × {draft.coverHeight} / {draft.coverAspectRatio}
                </p>
              ) : null}
            </div>
            <label className="block">
              <FieldLabel>{editorCopy.status}</FieldLabel>
              <select className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0" value={draft.status} onChange={(event) => updateDraft("status", event.target.value as EditorStatus)}>
                <option className="bg-surface" value="draft">{editorCopy.draft}</option>
                <option className="bg-surface" value="published">{editorCopy.published}</option>
                <option className="bg-surface" value="scheduled">{editorCopy.scheduled}</option>
              </select>
            </label>
            <AdminInput label={editorCopy.publishedAt} placeholder={localeCopy.publishAtPlaceholder} type="datetime-local" value={draft.publishedAt} onChange={(event) => updateDraft("publishedAt", event.target.value)} />
            <ToggleField checked={draft.featured} hint={localeCopy.featuredHint} label={editorCopy.featured} onChange={(checked) => updateDraft("featured", checked)} />
            <ToggleField checked={draft.pinned} hint={localeCopy.pinnedHint} label={editorCopy.pinned} onChange={(checked) => updateDraft("pinned", checked)} />
            <div className="border-t border-outline-variant/10 pt-4">
              <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">{editorCopy.seoOptions}</h2>
              <div className="space-y-7">
                <AdminInput label={`${editorCopy.seoTitle} - ${activeLocale}`} placeholder={localeCopy.seoTitlePlaceholder} value={activeSeoTitle} onChange={(event) => updateLocalizedField("seoTitle", event.target.value)} />
                <AdminTextarea label={`${editorCopy.seoDescription} - ${activeLocale}`} placeholder={localeCopy.seoDescriptionPlaceholder} rows={3} value={activeSeoDescription} onChange={(event) => updateLocalizedField("seoDescription", event.target.value)} />
              </div>
            </div>
            {activeLocale !== "zh-CN" ? (
              <div className="border-t border-outline-variant/10 pt-4">
                <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">{localeCopy.translationLocks}</h2>
                <p className="mb-4 text-sm leading-6 text-on-surface-variant">{localeCopy.translationLocksHint}</p>
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
                        <span className="flex items-center gap-2">
                          <span>{locked ? localeCopy.manualOverride : localeCopy.autoTranslation}</span>
                          {locked ? <Lock aria-hidden size={14} /> : <Unlock aria-hidden size={14} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <AdminButton className="mt-4 px-3 py-2" variant="ghost" onClick={() => restoreAutoSync(activeLocale)}>
                  <RotateCcw aria-hidden size={14} />
                  {localeCopy.restoreAutoSync}
                </AdminButton>
              </div>
            ) : null}
            <div className="border-t border-outline-variant/10 pt-4">
              <h2 className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">{localeCopy.aiTools}</h2>
              <div className="grid gap-3">
                <AdminButton variant="ghost" onClick={() => void applyAiSummary()}>
                  {localeCopy.generateSummary}
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => void applyAiTags()}>
                  {localeCopy.generateTags}
                </AdminButton>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[58vh] flex-col bg-background md:min-h-[620px] xl:min-h-0">
          <div className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-outline-variant/10 bg-surface-container-lowest/50 px-4 text-on-surface-variant md:px-6">
            {toolbarItems.map((item) => {
              const Icon = item.icon;
              const label = editorCopy.toolbar[item.command];
              return (
                <button
                  key={item.command}
                  aria-label={label}
                  className={cn("grid size-10 shrink-0 place-items-center transition hover:text-primary focus:outline-none focus:ring-1 focus:ring-outline-variant/40", item.divider ? "ml-2 border-l border-outline-variant/20 pl-4" : "")}
                  title={label}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleToolbarCommand(item.command);
                  }}
                >
                  <Icon aria-hidden size={18} strokeWidth={1.6} />
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto py-10 md:py-14">
            <div className="mx-auto w-full max-w-3xl px-6 md:px-8">
              <label className="mb-4 flex items-center justify-between">
                <span className="label-mono">{editorCopy.markdownMdx}</span>
                <span className="font-mono text-label-mono uppercase tracking-widest text-outline">{editorCopy.words(wordCount)}</span>
              </label>
              <textarea
                ref={textareaRef}
                aria-label={editorCopy.markdownMdx}
                className="min-h-[62vh] w-full resize-none border-0 bg-transparent font-body text-[18px] leading-8 text-on-surface outline-none focus:ring-0 placeholder:text-on-surface-variant/50"
                spellCheck
                value={activeContent}
                onChange={(event) => updateLocalizedField("content", event.target.value)}
              />
            </div>
          </div>
          <div className="flex h-10 shrink-0 items-center justify-between border-t border-outline-variant/10 bg-surface-container-lowest px-6">
            <div className="flex gap-4">
              <span className="font-mono text-label-mono text-outline">{editorCopy.words(wordCount)}</span>
              <span className="font-mono text-label-mono text-outline">{editorCopy.readingTime}: {readingTime}</span>
            </div>
            <span className="hidden font-mono text-label-mono text-outline sm:block">{editorCopy.markdownSupported}</span>
          </div>
        </section>

        <aside className="max-h-none overflow-y-auto border-t border-outline-variant/10 bg-surface-container-low xl:max-h-full xl:border-l xl:border-t-0">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/90 p-4 backdrop-blur-md">
            <span className="font-mono text-label-mono uppercase tracking-widest text-primary">{editorCopy.livePreview}</span>
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
                {editorCopy.journal} - {category.name}
              </p>
              <h2 className="mb-6 font-serif text-display-lg leading-tight text-on-background">{previewSource.title || editorCopy.untitledEditorial}</h2>
              <p className="mb-6 text-body-lg italic text-on-surface-variant">{previewSource.excerpt}</p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                <span>{brandText}</span>
                <span className="size-1 rounded-full bg-outline-variant" />
                <span>{draft.publishedAt || editorCopy.unscheduled}</span>
                <span className="size-1 rounded-full bg-outline-variant" />
                <span>{previewReadingTime}</span>
              </div>
            </header>
            <div className="relative mb-10 h-72 overflow-hidden bg-surface-container-low">
              {draft.coverImage ? (
                <img alt="" className="h-full w-full grayscale" src={draft.coverImage} style={{ objectFit: coverObjectFit, objectPosition: coverObjectPosition }} />
              ) : null}
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
