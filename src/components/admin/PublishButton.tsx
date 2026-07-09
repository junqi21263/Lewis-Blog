import { Send } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";

export default function PublishButton() {
  function publishCurrentPost() {
    window.dispatchEvent(new CustomEvent("admin:publish-current-post"));
  }

  return (
    <AdminButton className="rounded-none sm:rounded-full" variant="primary" onClick={publishCurrentPost}>
      <Send aria-hidden size={14} strokeWidth={1.7} />
      Publish
    </AdminButton>
  );
}
