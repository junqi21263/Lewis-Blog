import { Send } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";

export default function PublishButton() {
  return (
    <AdminButton className="rounded-none sm:rounded-full" variant="primary">
      <Send aria-hidden size={14} strokeWidth={1.7} />
      Publish
    </AdminButton>
  );
}
