import MetricsDashboard from "@/components/admin/MetricsDashboard";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Performance Metrics Dashboard",
  description: "View storage savings and client load times for WebP page renders.",
};

export default async function AdminMetricsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Verify Admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      <div className="border-b border-surface-container-high pb-4">
        <h1 className="text-3xl font-headline font-bold text-on-surface">
          Performance & Telemetry Dashboard
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Monitor PDF-to-WebP compression ratios, processing metrics, and client-side page load times.
        </p>
      </div>

      <MetricsDashboard />
    </div>
  );
}
