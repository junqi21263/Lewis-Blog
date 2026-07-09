"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { brandDisplayModes, normalizeBrandJson, type BrandContentFields, type BrandDisplayMode } from "@/components/brand/brandContent";
import { normalizeFooterJson, type FooterContentFields } from "@/components/footer/footerContent";
import { homepageContentFields, normalizeHomepageJson, type HomepageContentFields } from "@/components/home/homepageContent";
import {
  normalizePageCopyJson,
  pageCopyFields,
  pageCopyKeys,
  type PageCopyField,
  type PageCopyKey,
} from "@/components/pages/pageCopy";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";
import { localeLabel, locales, type Locale } from "@/i18n/config";

type SettingsSection = "settings" | "brand" | "footer" | "homepage" | "pageCopy";

function settingsTranslationOptions(footerLocale: Locale, homepageLocale: Locale, pageCopyLocale: Locale, section: SettingsSection) {
  return {
    ...(section === "footer" && footerLocale === "zh-CN" ? { translateFooterFrom: "zh-CN" as const } : {}),
    ...(section === "homepage" && homepageLocale === "zh-CN" ? { translateHomepageFrom: "zh-CN" as const } : {}),
    ...(section === "pageCopy" && pageCopyLocale === "zh-CN" ? { translatePageCopyFrom: "zh-CN" as const } : {}),
  };
}

export default function AdminSettingsPage() {
  const { data, error, updateSiteSettings, uploadAsset } = useCmsData();
  const { dictionary, locale } = useAdminI18n();
  const [settings, setSettings] = useState(data.siteSettings);
  const [activeBrandLocale, setActiveBrandLocale] = useState<Locale>("zh-CN");
  const [activeFooterLocale, setActiveFooterLocale] = useState<Locale>("zh-CN");
  const [activeHomepageLocale, setActiveHomepageLocale] = useState<Locale>("zh-CN");
  const [activePageCopyLocale, setActivePageCopyLocale] = useState<Locale>("zh-CN");
  const [activePageCopyKey, setActivePageCopyKey] = useState<PageCopyKey>("journal");
  const [warning, setWarning] = useState("");
  const [saveState, setSaveState] = useState("Saved");
  const initializedRef = useRef(false);
  const skipNextSaveRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lastChangedSectionRef = useRef<SettingsSection>("settings");
  const { isDark, setTheme } = useThemeMode();
  const statusCopy =
    locale === "zh-CN"
      ? { uploading: "上传中", saving: "保存中", mark: "L." }
      : locale === "zh-TW"
        ? { uploading: "上傳中", saving: "儲存中", mark: "L." }
        : { uploading: "Uploading", saving: "Saving", mark: "L." };
  const homepageCopy =
    locale === "zh-CN"
      ? {
          title: "Homepage Section",
          description: "配置首页 Hero、文章、图库与最新文章模块文案。简体为源语言，保存后自动同步繁体和英文。",
          preview: "首页预览",
          heroEyebrow: "Hero 标签",
          heroHeadline: "Hero 标题",
          journalEyebrow: "文章模块标签",
          journalHeadline: "文章模块标题",
          galleryEyebrow: "图库模块标签",
          galleryHeadline: "图库模块标题",
          latestEyebrow: "最新文章标签",
          latestHeadline: "最新文章标题",
          latestCta: "最新文章按钮",
        }
      : locale === "zh-TW"
        ? {
            title: "Homepage Section",
            description: "配置首頁 Hero、文章、圖庫與最新文章模組文案。簡體為來源語言，儲存後自動同步繁體和英文。",
            preview: "首頁預覽",
            heroEyebrow: "Hero 標籤",
            heroHeadline: "Hero 標題",
            journalEyebrow: "文章模組標籤",
            journalHeadline: "文章模組標題",
            galleryEyebrow: "圖庫模組標籤",
            galleryHeadline: "圖庫模組標題",
            latestEyebrow: "最新文章標籤",
            latestHeadline: "最新文章標題",
            latestCta: "最新文章按鈕",
          }
        : {
            title: "Homepage Section",
            description: "Configure homepage hero, journal, gallery, and latest article copy. zh-CN is the source locale and syncs zh-TW and en-US on save.",
            preview: "Homepage Preview",
            heroEyebrow: "Hero Eyebrow",
            heroHeadline: "Hero Headline",
            journalEyebrow: "Journal Eyebrow",
            journalHeadline: "Journal Headline",
            galleryEyebrow: "Gallery Eyebrow",
            galleryHeadline: "Gallery Headline",
            latestEyebrow: "Latest Eyebrow",
            latestHeadline: "Latest Headline",
            latestCta: "Latest CTA",
          };
  const brandCopy =
    locale === "zh-CN"
      ? {
          title: "Brand Section",
          description: "配置前台 Header 与后台 CMS 品牌显示。支持文字、分行文字和图片 Logo。",
          brandName: "品牌名称",
          displayMode: "显示模式",
          logoText: "文字 Logo",
          logoImageUrl: "博客 Icon URL",
          logoAlt: "Icon Alt",
          cmsTitle: "CMS 标题",
          cmsSubtitle: "CMS 副标题",
          preview: "品牌预览",
          uploadLogo: "上传 Icon",
          text: "文本",
          stackedText: "分行文本",
          imageLogo: "图片 Logo",
        }
      : locale === "zh-TW"
        ? {
            title: "Brand Section",
            description: "配置前台 Header 與後台 CMS 品牌顯示。支援文字、分行文字和圖片 Logo。",
            brandName: "品牌名稱",
            displayMode: "顯示模式",
            logoText: "文字 Logo",
            logoImageUrl: "博客 Icon URL",
            logoAlt: "Icon Alt",
            cmsTitle: "CMS 標題",
            cmsSubtitle: "CMS 副標題",
            preview: "品牌預覽",
            uploadLogo: "上傳 Icon",
            text: "文字",
            stackedText: "分行文字",
            imageLogo: "圖片 Logo",
          }
        : {
            title: "Brand Section",
            description: "Configure the frontend header and admin CMS brand. Supports text, stacked text, and image logos.",
            brandName: "Brand Name",
            displayMode: "Display Mode",
            logoText: "Logo Text",
            logoImageUrl: "Blog Icon URL",
            logoAlt: "Icon Alt",
            cmsTitle: "CMS Title",
            cmsSubtitle: "CMS Subtitle",
            preview: "Brand Preview",
            uploadLogo: "Upload Icon",
            text: "Text",
            stackedText: "Stacked Text",
            imageLogo: "Image Logo",
          };

  useEffect(() => {
    skipNextSaveRef.current = true;
    setSettings(data.siteSettings);
    setWarning("");
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
  }, [data.siteSettings]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      void (async () => {
        setSaveState("Saving");
        try {
          const result = await updateSiteSettings(settings, settingsTranslationOptions(activeFooterLocale, activeHomepageLocale, activePageCopyLocale, lastChangedSectionRef.current));
          setWarning(result.warnings.join(" "));
          setSaveState("Saved");
        } catch {
          setSaveState("Unsaved");
        }
      })();
    }, 800);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [activeFooterLocale, activeHomepageLocale, activePageCopyLocale, settings, updateSiteSettings]);

  function updateField<Key extends keyof typeof settings>(key: Key, value: (typeof settings)[Key]) {
    lastChangedSectionRef.current = "settings";
    setSaveState("Unsaved");
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateBrandField<Key extends keyof BrandContentFields>(key: Key, value: BrandContentFields[Key]) {
    lastChangedSectionRef.current = "brand";
    setSaveState("Unsaved");
    setSettings((current) => {
      const brandJson = normalizeBrandJson(current.brandJson);

      return {
        ...current,
        brandJson: {
          ...brandJson,
          [activeBrandLocale]: {
            ...brandJson[activeBrandLocale],
            [key]: value,
          },
        },
      };
    });
  }

  function updateFooterField<Key extends keyof FooterContentFields>(key: Key, value: FooterContentFields[Key]) {
    lastChangedSectionRef.current = "footer";
    setSaveState("Unsaved");
    setSettings((current) => {
      const footerJson = normalizeFooterJson(current.footerJson);

      return {
        ...current,
        footerJson: {
          ...footerJson,
          [activeFooterLocale]: {
            ...footerJson[activeFooterLocale],
            [key]: value,
          },
        },
      };
    });
  }

  function updateHomepageField<Key extends keyof HomepageContentFields>(key: Key, value: HomepageContentFields[Key]) {
    lastChangedSectionRef.current = "homepage";
    setSaveState("Unsaved");
    setSettings((current) => {
      const homepageJson = normalizeHomepageJson(current.homepageJson);

      return {
        ...current,
        homepageJson: {
          ...homepageJson,
          [activeHomepageLocale]: {
            ...homepageJson[activeHomepageLocale],
            [key]: value,
          },
        },
      };
    });
  }

  function updatePageCopyField(key: PageCopyField, value: string) {
    lastChangedSectionRef.current = "pageCopy";
    setSaveState("Unsaved");
    setSettings((current) => {
      const pageCopyJson = normalizePageCopyJson(current.pageCopyJson);
      if (activePageCopyLocale !== "zh-CN") {
        pageCopyJson.translationModes[activePageCopyKey][activePageCopyLocale] = "manual";
      }
      pageCopyJson[activePageCopyKey][activePageCopyLocale][key] = value;
      return { ...current, pageCopyJson };
    });
  }

  function updatePageCopyMode(mode: "auto" | "manual") {
    if (activePageCopyLocale === "zh-CN") return;
    lastChangedSectionRef.current = "pageCopy";
    setSaveState("Unsaved");
    setSettings((current) => {
      const pageCopyJson = normalizePageCopyJson(current.pageCopyJson);
      pageCopyJson.translationModes[activePageCopyKey][activePageCopyLocale] = mode;
      return { ...current, pageCopyJson };
    });
  }

  async function saveNow() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setSaveState("Saving");
    try {
      const result = await updateSiteSettings(settings, settingsTranslationOptions(activeFooterLocale, activeHomepageLocale, activePageCopyLocale, lastChangedSectionRef.current));
      setWarning(result.warnings.join(" "));
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleLogoUpload(file: File) {
    setSaveState("Saving");
    try {
      const uploaded = await uploadAsset(file, "branding");
      const brandJson = normalizeBrandJson(settings.brandJson);
      const nextSettings = {
        ...settings,
        logoImageUrl: uploaded.url,
        brandJson: {
          ...brandJson,
          [activeBrandLocale]: {
            ...brandJson[activeBrandLocale],
            logoImageUrl: uploaded.url,
          },
        },
      };
      lastChangedSectionRef.current = "brand";
      setSettings(nextSettings);
      const result = await updateSiteSettings(nextSettings);
      setWarning(result.warnings.join(" "));
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="px-margin-mobile pb-section-gap md:px-margin-desktop">
      <div className="max-w-4xl">
        <input
          ref={logoInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.heic,.heif"
          className="hidden"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = "";
            if (file) {
              void handleLogoUpload(file);
            }
          }}
        />
        <header className="mb-16">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <h1 className="font-serif text-display-lg text-on-surface">{dictionary.settings.title}</h1>
            <SaveIndicator status={saveState} />
          </div>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            {dictionary.settings.description}
          </p>
        </header>
        {error ? (
          <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
            {error}
          </div>
        ) : null}
        {warning ? (
          <div className="mb-6 border border-outline-variant/20 bg-surface-container-low px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            {warning}
          </div>
        ) : null}

        <div className="space-y-12">
          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <h2 className="font-serif text-headline-md text-on-surface">{brandCopy.title}</h2>
                <p className="mt-2 max-w-xl font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{brandCopy.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locales.map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition data-[active=true]:border-on-surface data-[active=true]:bg-on-surface data-[active=true]:text-background"
                    data-active={activeBrandLocale === item}
                    type="button"
                    onClick={() => setActiveBrandLocale(item)}
                  >
                    {localeLabel(item)}
                  </button>
                ))}
              </div>
            </div>
            <BrandFieldsEditor
              brand={normalizeBrandJson(settings.brandJson)[activeBrandLocale]}
              copy={brandCopy}
              saveState={saveState}
              uploadingLabel={statusCopy.uploading}
              onChange={updateBrandField}
              onUpload={() => logoInputRef.current?.click()}
            />
          </AdminCard>

          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <h2 className="font-serif text-headline-md text-on-surface">{dictionary.settings.appearance}</h2>
                <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{dictionary.settings.environment}</p>
              </div>
              <div className="md:items-end">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{dictionary.settings.light}</span>
                  <button
                    aria-label="Toggle admin theme"
                    aria-pressed={isDark}
                    className="relative inline-flex h-6 w-12 items-center rounded-full bg-surface-container-high transition data-[dark=true]:bg-primary"
                    data-dark={isDark}
                    type="button"
                    onClick={() => setTheme(!isDark)}
                  >
                    <span
                      className="absolute left-1 top-1 size-4 rounded-full bg-background transition-transform data-[dark=true]:translate-x-6"
                      data-dark={isDark}
                    />
                  </button>
                  <span className={isDark ? "font-mono text-label-mono uppercase tracking-widest text-on-surface" : "font-mono text-label-mono uppercase tracking-widest text-on-surface-variant"}>
                    {dictionary.settings.dark}
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-serif text-headline-md text-on-surface">{dictionary.settings.searchEngine}</h2>
              <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{dictionary.settings.globalMeta}</p>
            </div>
            <div className="space-y-8">
              <AdminInput
                label={dictionary.settings.globalTitleFormat}
                value={settings.titleFormat}
                onChange={(event) => updateField("titleFormat", event.target.value)}
              />
              <AdminTextarea
                label={dictionary.settings.defaultDescription}
                rows={3}
                value={settings.defaultDescription}
                onChange={(event) => updateField("defaultDescription", event.target.value)}
              />
            </div>
          </AdminCard>

          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <h2 className="font-serif text-headline-md text-on-surface">{homepageCopy.title}</h2>
                <p className="mt-2 max-w-xl font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  {homepageCopy.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locales.map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition data-[active=true]:border-on-surface data-[active=true]:bg-on-surface data-[active=true]:text-background"
                    data-active={activeHomepageLocale === item}
                    type="button"
                    onClick={() => setActiveHomepageLocale(item)}
                  >
                    {localeLabel(item)}
                  </button>
                ))}
              </div>
            </div>
            <HomepageFieldsEditor
              copy={homepageCopy}
              homepage={normalizeHomepageJson(settings.homepageJson)[activeHomepageLocale]}
              onChange={updateHomepageField}
            />
          </AdminCard>

          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-serif text-headline-md text-on-surface">Page Copy</h2>
              <p className="mt-2 max-w-xl font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                编辑频道 Hero、空状态与 metadata 文案。zh-CN 是源语言；AUTO 跟随源语言，MANUAL 保留人工内容。
              </p>
            </div>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {pageCopyKeys.map((page) => (
                <button
                  key={page}
                  className="min-h-11 shrink-0 border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant data-[active=true]:bg-on-surface data-[active=true]:text-background"
                  data-active={activePageCopyKey === page}
                  type="button"
                  onClick={() => setActivePageCopyKey(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {locales.map((item) => (
                  <button
                    key={item}
                    className="min-h-11 border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant data-[active=true]:bg-on-surface data-[active=true]:text-background"
                    data-active={activePageCopyLocale === item}
                    type="button"
                    onClick={() => setActivePageCopyLocale(item)}
                  >
                    {localeLabel(item)}
                  </button>
                ))}
              </div>
              {activePageCopyLocale !== "zh-CN" ? (
                <div className="flex gap-2">
                  {(["auto", "manual"] as const).map((mode) => (
                    <button
                      key={mode}
                      className="min-h-11 border border-outline-variant/20 px-4 py-2 font-mono text-label-mono tracking-widest text-on-surface-variant data-[active=true]:border-secondary data-[active=true]:text-secondary"
                      data-active={normalizePageCopyJson(settings.pageCopyJson).translationModes[activePageCopyKey][activePageCopyLocale] === mode}
                      type="button"
                      onClick={() => updatePageCopyMode(mode)}
                    >
                      {mode === "auto" ? "AUTO" : "MANUAL"}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <PageCopyFieldsEditor
              copy={normalizePageCopyJson(settings.pageCopyJson)[activePageCopyKey][activePageCopyLocale]}
              onChange={updatePageCopyField}
            />
          </AdminCard>

          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <h2 className="font-serif text-headline-md text-on-surface">{dictionary.settings.footer}</h2>
                <p className="mt-2 max-w-xl font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  {dictionary.settings.footerDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locales.map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition data-[active=true]:border-on-surface data-[active=true]:bg-on-surface data-[active=true]:text-background"
                    data-active={activeFooterLocale === item}
                    type="button"
                    onClick={() => setActiveFooterLocale(item)}
                  >
                    {localeLabel(item)}
                  </button>
                ))}
              </div>
            </div>
            <FooterFieldsEditor
              copy={dictionary.settings}
              footer={normalizeFooterJson(settings.footerJson)[activeFooterLocale]}
              nav={dictionary.nav}
              onChange={updateFooterField}
            />
          </AdminCard>

          <div className="flex justify-end">
            <AdminButton variant="primary" onClick={() => void saveNow()}>
              {saveState === "Saving" ? statusCopy.saving : dictionary.settings.saveChanges}
            </AdminButton>
          </div>
        </div>
      </div>
    </main>
  );
}

type FooterFieldsEditorProps = {
  copy: {
    footerBrand: string;
    footerCopy: string;
    footerCopyright: string;
    footerLocation: string;
    footerPreview: string;
  };
  footer: FooterContentFields;
  nav: {
    posts: string;
    gallery: string;
    gear: string;
    videos: string;
    about: string;
  };
  onChange: <Key extends keyof FooterContentFields>(key: Key, value: FooterContentFields[Key]) => void;
};

type BrandCopy = {
  title: string;
  description: string;
  brandName: string;
  displayMode: string;
  logoText: string;
  logoImageUrl: string;
  logoAlt: string;
  cmsTitle: string;
  cmsSubtitle: string;
  preview: string;
  uploadLogo: string;
  text: string;
  stackedText: string;
  imageLogo: string;
};

type BrandFieldsEditorProps = {
  brand: BrandContentFields;
  copy: BrandCopy;
  saveState: string;
  uploadingLabel: string;
  onChange: <Key extends keyof BrandContentFields>(key: Key, value: BrandContentFields[Key]) => void;
  onUpload: () => void;
};

type HomepageCopy = Record<keyof HomepageContentFields | "title" | "description" | "preview", string>;

type HomepageFieldsEditorProps = {
  copy: HomepageCopy;
  homepage: HomepageContentFields;
  onChange: <Key extends keyof HomepageContentFields>(key: Key, value: HomepageContentFields[Key]) => void;
};

type PageCopyFieldsEditorProps = {
  copy: Record<PageCopyField, string>;
  onChange: (key: PageCopyField, value: string) => void;
};

function BrandFieldsEditor({ brand, copy, saveState, uploadingLabel, onChange, onUpload }: BrandFieldsEditorProps) {
  const modeLabels: Record<BrandDisplayMode, string> = {
    text: copy.text,
    stackedText: copy.stackedText,
    imageLogo: copy.imageLogo,
  };
  const logoText = brand.logoText || brand.brandName;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <AdminInput
          label={copy.brandName}
          value={brand.brandName}
          onChange={(event) => onChange("brandName", event.target.value)}
        />
        <AdminInput
          label={copy.logoText}
          value={brand.logoText}
          onChange={(event) => onChange("logoText", event.target.value)}
        />
      </div>
      <div>
        <span className="label-mono mb-3 block">{copy.displayMode}</span>
        <div className="grid gap-2 md:grid-cols-3">
          {brandDisplayModes.map((mode) => (
            <button
              key={mode}
              className="border border-outline-variant/20 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition data-[active=true]:bg-on-surface data-[active=true]:text-background"
              data-active={brand.brandDisplayMode === mode}
              type="button"
              onClick={() => onChange("brandDisplayMode", mode)}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <AdminInput
          label={copy.logoImageUrl}
          value={brand.logoImageUrl}
          onChange={(event) => onChange("logoImageUrl", event.target.value)}
        />
        <AdminButton className="w-fit" onClick={onUpload}>
          {saveState === "Saving" ? uploadingLabel : copy.uploadLogo}
        </AdminButton>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <AdminInput
          label={copy.logoAlt}
          value={brand.logoAlt}
          onChange={(event) => onChange("logoAlt", event.target.value)}
        />
        <AdminInput
          label={copy.cmsTitle}
          value={brand.cmsTitle}
          onChange={(event) => onChange("cmsTitle", event.target.value)}
        />
      </div>
      <AdminInput
        label={copy.cmsSubtitle}
        value={brand.cmsSubtitle}
        onChange={(event) => onChange("cmsSubtitle", event.target.value)}
      />
      <div className="border-t border-outline-variant/10 pt-8">
        <span className="label-mono mb-6 block">{copy.preview}</span>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="label-mono mb-4">Header</p>
            <div className="flex min-h-20 items-center border border-outline-variant/10 px-6">
              {brand.brandDisplayMode === "imageLogo" && brand.logoImageUrl ? (
                <Image alt={brand.logoAlt || brand.brandName} className="h-auto w-auto max-h-10 max-w-[180px] object-contain grayscale" height={48} width={180} src={brand.logoImageUrl} />
              ) : (
                <span className="whitespace-pre-line font-serif text-headline-md text-on-surface">{logoText}</span>
              )}
            </div>
          </div>
          <div>
            <p className="label-mono mb-4">CMS</p>
            <div className="min-h-20 border border-outline-variant/10 px-6 py-5">
              <p className="font-serif text-headline-md text-on-surface">{brand.cmsTitle || brand.brandName}</p>
              {brand.cmsSubtitle ? <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{brand.cmsSubtitle}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomepageFieldsEditor({ copy, homepage, onChange }: HomepageFieldsEditorProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {homepageContentFields.map((field) =>
          field.endsWith("Headline") ? (
            <AdminTextarea
              key={field}
              label={copy[field]}
              rows={3}
              value={homepage[field]}
              onChange={(event) => onChange(field, event.target.value)}
            />
          ) : (
            <AdminInput
              key={field}
              label={copy[field]}
              value={homepage[field]}
              onChange={(event) => onChange(field, event.target.value)}
            />
          ),
        )}
      </div>
      <div className="border-t border-outline-variant/10 pt-8">
        <span className="label-mono mb-6 block">{copy.preview}</span>
        <div className="space-y-8">
          <div>
            <p className="label-mono mb-3">{homepage.heroEyebrow}</p>
            <p className="max-w-3xl font-serif text-headline-lg text-on-surface">{homepage.heroHeadline}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="label-mono mb-3">{homepage.latestEyebrow}</p>
              <p className="font-serif text-headline-md text-on-surface">{homepage.latestHeadline}</p>
            </div>
            <div>
              <p className="label-mono mb-3">{homepage.journalEyebrow}</p>
              <p className="font-serif text-headline-md text-on-surface">{homepage.journalHeadline}</p>
            </div>
            <div>
              <p className="label-mono mb-3">{homepage.galleryEyebrow}</p>
              <p className="font-serif text-headline-md text-on-surface">{homepage.galleryHeadline}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageCopyFieldsEditor({ copy, onChange }: PageCopyFieldsEditorProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {pageCopyFields.map((field) =>
        field === "description" || field === "emptyDescription" ? (
          <AdminTextarea
            key={field}
            className={field === "description" ? "md:col-span-2" : ""}
            label={field}
            rows={3}
            value={copy[field]}
            onChange={(event) => onChange(field, event.target.value)}
          />
        ) : (
          <AdminInput
            key={field}
            label={field}
            value={copy[field]}
            onChange={(event) => onChange(field, event.target.value)}
          />
        ),
      )}
    </div>
  );
}

function FooterFieldsEditor({ copy, footer, nav, onChange }: FooterFieldsEditorProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <AdminInput
          label={copy.footerBrand}
          value={footer.brand}
          onChange={(event) => onChange("brand", event.target.value)}
        />
        <AdminInput
          label={copy.footerCopyright}
          value={footer.copyright}
          onChange={(event) => onChange("copyright", event.target.value)}
        />
      </div>
      <AdminTextarea
        label={copy.footerCopy}
        rows={3}
        value={footer.description}
        onChange={(event) => onChange("description", event.target.value)}
      />
      <AdminInput
        label={copy.footerLocation}
        value={footer.location}
        onChange={(event) => onChange("location", event.target.value)}
      />
      <div className="border-t border-outline-variant/10 pt-8">
        <span className="label-mono mb-6 block">{copy.footerPreview}</span>
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.65fr)_minmax(180px,0.35fr)]">
          <div>
            <p className="mb-4 font-serif text-headline-md text-on-surface">{footer.brand}</p>
            <p className="max-w-md text-body-md text-on-surface-variant">{footer.description}</p>
            <div className="mt-8 space-y-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              <p>{footer.copyright}</p>
              <p>{footer.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant md:justify-items-end">
            <span>{nav.posts}</span>
            <span>{nav.gallery}</span>
            <span>{nav.gear}</span>
            <span>{nav.videos}</span>
            <span>{nav.about}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
