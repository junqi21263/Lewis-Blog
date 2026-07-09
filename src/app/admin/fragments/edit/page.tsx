"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FragmentEditorScreen from "@/components/admin/FragmentEditorScreen";

function EditFragmentPageContent() {
  const searchParams = useSearchParams();
  const fragmentId = searchParams.get("id") ?? undefined;

  return <FragmentEditorScreen fragmentId={fragmentId} />;
}

export default function EditFragmentPage() {
  return (
    <Suspense fallback={<FragmentEditorScreen />}>
      <EditFragmentPageContent />
    </Suspense>
  );
}
