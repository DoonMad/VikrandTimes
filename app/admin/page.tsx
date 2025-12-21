import AdminForm from "@/components/admin/AdminForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";


export default async function Admin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) notFound();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (error || !profile || profile.role !== "admin") {
        notFound();
    }

    return <AdminForm />
}