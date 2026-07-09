"use client";

import { Languages, RefreshCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AboutPageContent from "@/components/about/AboutPageContent";
import { aboutImageDefaults, type AboutImageAspectRatio, type AboutImageFit, type AboutImagePositionX, type AboutImagePositionY } from "@/components/about/imagePresentation";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { createEmptyAboutPage, type AboutContentFields, type AboutSeoFields, type SitePage } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import type { Locale } from "@/i18n/config";
import { useAdminI18n } from "@/i18n/admin";
import { cn } from "@/lib/utils";

const localeTabs: Array<{ locale: Locale; short: string; label: string }> = [
  { locale: "zh-CN", short: "简", label: "简体中文" },
  { locale: "zh-TW", short: "繁", label: "繁體中文" },
  { locale: "en-US", short: "EN", label: "English" },
];

type SaveState = "Unsaved" | "Saving" | "Saved";

const emptyContent: AboutContentFields = {
  eyebrow: "",
  headline: "",
  description: "",
  body: "",
  heroImage: "",
  imageAlt: "",
  ...aboutImageDefaults,
};

const emptySeo: AboutSeoFields = {
  title: "",
  description: "",
};

const imageFitOptions: AboutImageFit[] = ["cover", "contain", "full-width"];
const imagePositionXOptions: AboutImagePositionX[] = ["left", "center", "right"];
const imagePositionYOptions: AboutImagePositionY[] = ["top", "center", "bottom"];
const imageAspectRatioOptions: AboutImageAspectRatio[] = ["wide", "cinema", "square", "original"];

type AdminSelectProps<Value extends string> = {
  label: string;
  value: Value;
  options: Value[];
  labels: Record<Value, string>;
  onChange: (value: Value) => void;
};

function AdminSelect<Value extends string>({ label, value, options, labels, onChange }: AdminSelectProps<Value>) {
  return (
    <label className="block">
      <span className="label-mono mb-2 block">{label}</span>
      <select
        className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value as Value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminAboutPage() {
  const { data, error, updateSitePage, uploadAsset } = useCmsData();
  const { dictionary } = useAdminI18n();
  const [page, setPage] = useState<SitePage>(createEmptyAboutPage());
  const [saveState, setSaveState] = useState<SaveState>("Saved");
  const [notice, setNotice] = useState("");
  const [activeLocale, setActiveLocale] = useState<Locale>("zh-CN");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPage(data.sitePages.about ?? createEmptyAboutPage());
    setSaveState("Saved");
  }, [data.sitePages.about]);

  const content = { ...emptyContent, ...(page.contentJson["zh-CN"] ?? {}), ...(page.contentJson[activeLocale] ?? {}) };
  const seo = page.seoJson[activeLocale] ?? page.seoJson["zh-CN"] ?? emptySeo;

  function localizedStatus(value: SaveState) {
    if (value === "Saved") return dictionary.editor.saved;
    if (value === "Saving") return dictionary.editor.saving;
    return dictionary.editor.unsaved;
  }

  function updateContentField<Key extends keyof AboutContentFields>(key: Key, value: AboutContentFields[Key]) {
    setPage((current) => ({
      ...current,
      contentJson: {
        ...current.contentJson,
        [activeLocale]: {
          ...emptyContent,
          ...(current.contentJson[activeLocale] ?? current.contentJson["zh-CN"] ?? {}),
          [key]: value,
        },
      },
    }));
    setSaveState("Unsaved");
  }

  function updateSeoField<Key extends keyof AboutSeoFields>(key: Key, value: AboutSeoFields[Key]) {
    setPage((current) => ({
      ...current,
      seoJson: {
        ...current.seoJson,
        [activeLocale]: {
          ...emptySeo,
          ...(current.seoJson[activeLocale] ?? current.seoJson["zh-CN"] ?? {}),
          [key]: value,
        },
      },
    }));
    setSaveState("Unsaved");
  }

  async function savePage(regenerateLocales: Locale[] = []) {
    setSaveState("Saving");
    try {
      const result = await updateSitePage(page, {
        generateTranslations: true,
        regenerateLocales,
      });
      setPage(result.data);
      setNotice(result.warnings.join(" "));
      setSaveState("Saved");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Unable to save about page.");
      setSaveState("Unsaved");
    }
  }

  async function handleHeroUpload(file: File) {
    setSaveState("Saving");
    try {
      const uploaded = await uploadAsset(file, "pages");
      setPage((current) => ({
        ...current,
        contentJson: {
          ...current.contentJson,
          [activeLocale]: {
            ...emptyContent,
            ...(current.contentJson[activeLocale] ?? current.contentJson["zh-CN"] ?? {}),
            heroImage: uploaded.url,
          },
        },
      }));
      setSaveState("Unsaved");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Unable to upload image.");
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="grid min-w-0 gap-8 px-margin-mobile pb-section-gap md:px-margin-desktop xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.heic,.heif"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) {
            void handleHeroUpload(file);
          }
        }}
      />

      <section className="min-w-0">
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <h1 className="font-serif text-[42px] leading-tight text-on-surface md:text-display-lg">{dictionary.about.title}</h1>
            <SaveIndicator status={localizedStatus(saveState)} />
          </div>
          <p className="max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">{dictionary.about.description}</p>
        </header>

        {error ? (
          <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mb-6 border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">
            {notice}
          </div>
        ) : null}

        <AdminCard className="min-w-0 bg-surface-container-low p-5 md:p-10">
          <div className="mb-8 flex flex-col gap-6 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="label-mono mb-2">{dictionary.about.sourceLanguage}</p>
              <h2 className="font-serif text-headline-md text-on-surface">{dictionary.about.title}</h2>
            </div>
            <div className="flex max-w-full flex-wrap items-center gap-3">
              <div className="inline-flex max-w-full overflow-x-auto rounded-full border border-outline-variant/20 bg-surface-container-lowest/60 p-1">
                {localeTabs.map((tab) => (
                  <button
                    key={tab.locale}
                    className={cn(
                      "min-w-12 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition",
                      activeLocale === tab.locale ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-surface",
                    )}
                    type="button"
                    onClick={() => setActiveLocale(tab.locale)}
                  >
                    {tab.short}
                  </button>
                ))}
              </div>
              <AdminButton disabled={activeLocale === "zh-CN"} onClick={() => void savePage([activeLocale])}>
                <RefreshCcw aria-hidden size={14} />
                {dictionary.about.regenerate}
              </AdminButton>
              <AdminButton variant="primary" onClick={() => void savePage()}>
                {dictionary.settings.saveChanges}
              </AdminButton>
            </div>
          </div>

          <div className="space-y-8">
            <AdminInput label={dictionary.about.eyebrow} value={content.eyebrow ?? ""} onChange={(event) => updateContentField("eyebrow", event.target.value)} />
            <AdminInput label={dictionary.about.headline} value={content.headline ?? ""} onChange={(event) => updateContentField("headline", event.target.value)} />
            <AdminTextarea label={dictionary.editor.excerpt} rows={3} value={content.description ?? ""} onChange={(event) => updateContentField("description", event.target.value)} />
            <AdminTextarea label={dictionary.about.body} rows={10} value={content.body ?? ""} onChange={(event) => updateContentField("body", event.target.value)} />
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <AdminInput label={dictionary.about.heroImage} value={content.heroImage ?? ""} onChange={(event) => updateContentField("heroImage", event.target.value)} />
              <AdminButton onClick={() => fileInputRef.current?.click()}>
                <Upload aria-hidden size={14} />
                {dictionary.gallery.uploadImage}
              </AdminButton>
            </div>
            <AdminInput label={dictionary.about.imageAlt} value={content.imageAlt ?? ""} onChange={(event) => updateContentField("imageAlt", event.target.value)} />
            <div className="grid gap-6 md:grid-cols-2">
              <AdminSelect
                label={dictionary.about.imageFit}
                labels={dictionary.about.imageFitOptions}
                options={imageFitOptions}
                value={content.imageFit}
                onChange={(value) => updateContentField("imageFit", value)}
              />
              <AdminSelect
                label={dictionary.about.imageAspectRatio}
                labels={dictionary.about.imageAspectRatioOptions}
                options={imageAspectRatioOptions}
                value={content.imageAspectRatio}
                onChange={(value) => updateContentField("imageAspectRatio", value)}
              />
              <AdminSelect
                label={dictionary.about.imagePositionX}
                labels={dictionary.about.imagePositionXOptions}
                options={imagePositionXOptions}
                value={content.imagePositionX}
                onChange={(value) => updateContentField("imagePositionX", value)}
              />
              <AdminSelect
                label={dictionary.about.imagePositionY}
                labels={dictionary.about.imagePositionYOptions}
                options={imagePositionYOptions}
                value={content.imagePositionY}
                onChange={(value) => updateContentField("imagePositionY", value)}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <AdminInput label={dictionary.about.seoTitle} value={seo.title ?? ""} onChange={(event) => updateSeoField("title", event.target.value)} />
              <AdminTextarea label={dictionary.about.seoDescription} rows={3} value={seo.description ?? ""} onChange={(event) => updateSeoField("description", event.target.value)} />
            </div>
          </div>
        </AdminCard>
      </section>

      <aside className="min-w-0 xl:sticky xl:top-36 xl:self-start">
        <details className="border border-outline-variant/10 bg-surface-container-low xl:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between px-5 py-4 font-mono text-label-mono uppercase tracking-widest text-primary">
            {dictionary.about.livePreview}
          </summary>
          <div className="max-h-[70vh] overflow-auto border-t border-outline-variant/10 bg-background">
            <AboutPageContent
              containerClassName="pb-10 pt-8 [&_.editorial-shell]:px-5 [&_h1]:text-headline-md [&_h1]:md:text-headline-md"
              content={content}
              fallback={{
                eyebrow: dictionary.about.eyebrow,
                headline: dictionary.about.emptyTitle,
                description: dictionary.about.emptyDescription,
                imageAlt: dictionary.about.emptyTitle,
                imagePlaceholderTitle: dictionary.about.emptyTitle,
              }}
              title={content.headline || dictionary.about.emptyTitle}
            />
          </div>
        </details>

        <AdminCard className="hidden overflow-hidden bg-surface-container-low xl:block">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
            <div>
              <p className="label-mono">{dictionary.about.livePreview}</p>
            </div>
            <Languages aria-hidden className="text-on-surface-variant" size={18} />
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-auto bg-background">
            <AboutPageContent
              containerClassName="pb-12 pt-10 [&_.editorial-shell]:px-6 [&_h1]:text-headline-lg [&_h1]:md:text-headline-lg"
              content={content}
              fallback={{
                eyebrow: dictionary.about.eyebrow,
                headline: dictionary.about.emptyTitle,
                description: dictionary.about.emptyDescription,
                imageAlt: dictionary.about.emptyTitle,
                imagePlaceholderTitle: dictionary.about.emptyTitle,
              }}
              title={content.headline || dictionary.about.emptyTitle}
            />
          </div>
        </AdminCard>
      </aside>
    </main>
  );
}
