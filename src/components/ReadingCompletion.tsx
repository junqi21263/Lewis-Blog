"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/useI18n";

type ReadingCompletionProps = {
  slug: string;
};

export default function ReadingCompletion({ slug }: ReadingCompletionProps) {
  const { locale } = useI18n();
  const storageKey = `reading-complete:${slug}`;
  const [complete, setComplete] = useState(false);
  const title = locale === "zh-CN" ? "阅读完成" : locale === "zh-TW" ? "閱讀完成" : "Reading Completion";
  const done = locale === "zh-CN" ? "这篇文章已在此设备上标记为读完。" : locale === "zh-TW" ? "這篇文章已在此裝置上標記為讀完。" : "This essay is marked complete on this device.";
  const hint = locale === "zh-CN" ? "读到文章末尾后，会在此设备上标记为已读完。" : locale === "zh-TW" ? "讀到文章末尾後，會在此裝置上標記為已讀完。" : "Reach the end of the essay to mark it complete on this device.";

  useEffect(() => {
    setComplete(window.localStorage.getItem(storageKey) === "true");

    function updateCompletion() {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      if (progress >= 0.9) {
        window.localStorage.setItem(storageKey, "true");
        setComplete(true);
      }
    }

    updateCompletion();
    window.addEventListener("scroll", updateCompletion, { passive: true });
    window.addEventListener("resize", updateCompletion);

    return () => {
      window.removeEventListener("scroll", updateCompletion);
      window.removeEventListener("resize", updateCompletion);
    };
  }, [storageKey]);

  return (
    <div className="mt-16 border-t border-outline-variant/10 pt-8">
      <div className="label-mono mb-3">{title}</div>
      <p className="text-body-md text-on-surface-variant">
        {complete ? done : hint}
      </p>
    </div>
  );
}
