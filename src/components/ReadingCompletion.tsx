"use client";

import { useEffect, useState } from "react";

type ReadingCompletionProps = {
  slug: string;
};

export default function ReadingCompletion({ slug }: ReadingCompletionProps) {
  const storageKey = `reading-complete:${slug}`;
  const [complete, setComplete] = useState(false);

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
      <div className="label-mono mb-3">Reading Completion</div>
      <p className="text-body-md text-on-surface-variant">
        {complete ? "This essay is marked complete on this device." : "Reach the end of the essay to mark it complete on this device."}
      </p>
    </div>
  );
}
