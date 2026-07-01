"use client";

import { useEffect, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";

export default function AdminSettingsPage() {
  const { data, error, updateSiteSettings } = useCmsData();
  const { dictionary } = useAdminI18n();
  const [settings, setSettings] = useState(data.siteSettings);
  const [saveState, setSaveState] = useState("Saved");
  const initializedRef = useRef(false);
  const skipNextSaveRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const { isDark, toggleTheme } = useThemeMode();

  useEffect(() => {
    skipNextSaveRef.current = true;
    setSettings(data.siteSettings);
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
          await updateSiteSettings(settings);
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
  }, [settings, updateSiteSettings]);

  function updateField<Key extends keyof typeof settings>(key: Key, value: (typeof settings)[Key]) {
    setSaveState("Unsaved");
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveNow() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setSaveState("Saving");
    try {
      await updateSiteSettings(settings);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="px-margin-mobile pb-section-gap md:px-margin-desktop">
      <div className="max-w-4xl">
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

        <div className="space-y-12">
          <AdminCard as="section" className="bg-surface-container-low p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-serif text-headline-md text-on-surface">{dictionary.settings.studioIdentity}</h2>
              <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{dictionary.settings.brandCore}</p>
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-8">
                <AdminInput
                  label={dictionary.settings.studioName}
                  value={settings.studioName}
                  onChange={(event) => updateField("studioName", event.target.value)}
                />
                <AdminInput
                  label={dictionary.settings.tagline}
                  value={settings.tagline}
                  onChange={(event) => updateField("tagline", event.target.value)}
                />
              </div>
              <div>
                <span className="label-mono mb-4 block">{dictionary.settings.logoMark}</span>
                <div className="flex items-center gap-6">
                  <div className="grid size-24 place-items-center rounded-full border border-outline-variant/20 bg-surface-container-high">
                    <span className="font-serif text-headline-lg text-on-surface">N.</span>
                  </div>
                  <AdminButton>{dictionary.settings.replace}</AdminButton>
                </div>
              </div>
            </div>
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
                    onClick={toggleTheme}
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

          <div className="flex justify-end">
            <AdminButton variant="primary" onClick={() => void saveNow()}>
              {saveState === "Saving" ? "Saving" : dictionary.settings.saveChanges}
            </AdminButton>
          </div>
        </div>
      </div>
    </main>
  );
}
