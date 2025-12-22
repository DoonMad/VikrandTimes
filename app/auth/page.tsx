import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Vikrand Times",
  description:
    "Sign in to your Vikrand Times account to manage subscriptions and access account features.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function auth() {
    const supabase = await createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if(user) {
        redirect("/");
    }

    return <AuthForm />
}