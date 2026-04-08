// app/admin/page.tsx
import AdminUploadForm from "@/components/admin/AdminForm";
import SpecialEditionAdminForm from "@/components/admin/SpecialEditionAdminForm";
import AdminEditionsTable from "@/components/admin/AdminEditionsTable";
import SpecialEditionManagementTable from "@/components/admin/SpecialEditionManagementTable";
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
      <h1 className="text-3xl font-headline font-bold text-on-surface mb-8 border-b border-surface-container-high pb-4">
        Admin Publishing Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Normal Edition */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-headline font-bold text-on-surface">Normal Weekly Edition</h2>
            <p className="text-sm text-on-surface-variant mt-1">Standard Thursday publications mapped strictly by date.</p>
          </div>
          <AdminUploadForm />
        </div>

        {/* Special Edition */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-headline font-bold text-secondary">Special Edition</h2>
            <p className="text-sm text-on-surface-variant mt-1">Festival editions and special coverage with custom URLs.</p>
          </div>
          <SpecialEditionAdminForm />
        </div>
      </div>

      {/* Editor Management Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-6 border-b border-surface-container-high pb-4">
          Manage Published Editions
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Normal Edition Table */}
          <div>
             <div className="mb-4">
               <h3 className="text-lg font-headline font-semibold text-on-surface">Weekly Editions</h3>
             </div>
             <AdminEditionsTable />
          </div>

          {/* Special Edition Table */}
          <div>
            <div className="mb-4">
               <h3 className="text-lg font-headline font-semibold text-secondary">Special Editions</h3>
             </div>
             <SpecialEditionManagementTable />
          </div>
        </div>
      </div>
    </div>
  );
}