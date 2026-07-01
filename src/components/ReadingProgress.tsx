"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(scrollTop / height, 1) : 0);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[60] h-1 w-full bg-transparent">
      <div className="h-full w-full bg-outline-variant/40" style={{ transform: `scaleX(${progress})`, transformOrigin: "0 50%" }} />
    </div>
  );
}
