"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostEditorScreen from "@/components/admin/PostEditorScreen";

function EditPostPageContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id") ?? undefined;

  return <PostEditorScreen postId={postId} />;
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<PostEditorScreen />}>
      <EditPostPageContent />
    </Suspense>
  );
}
