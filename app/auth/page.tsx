import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";

export default async function auth() {
    const supabase = await createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if(user) {
        redirect("/");
    }

    return <AuthForm />
}