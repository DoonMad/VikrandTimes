// app/admin/page.tsx - SIMPLIFIED
import AdminUploadForm from "@/components/admin/AdminForm";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Upload New Edition</h1>
      <AdminUploadForm />
    </div>
  );
}