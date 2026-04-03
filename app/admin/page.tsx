// app/admin/page.tsx
import AdminUploadForm from "@/components/admin/AdminForm";
import SpecialEditionAdminForm from "@/components/admin/SpecialEditionAdminForm";
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
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        Admin Publishing Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Normal Edition */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Normal Weekly Edition</h2>
            <p className="text-sm text-gray-500">Standard Thursday publications mapped strictly by date.</p>
          </div>
          <AdminUploadForm />
        </div>

        {/* Special Edition */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-amber-800">Special Edition</h2>
            <p className="text-sm text-gray-500">Festival editions and special coverage with custom URLs.</p>
          </div>
          <SpecialEditionAdminForm />
        </div>
      </div>
    </div>
  );
}