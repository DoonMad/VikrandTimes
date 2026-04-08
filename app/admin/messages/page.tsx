// app/admin/messages/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import MessagesTable from "@/components/admin/MessagesTable";
import { Mail, MessageSquare, CheckCircle, Clock } from "lucide-react";

export default async function MessagesPage() {
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

  // Get messages with pagination
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get stats
  const { count: total } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true });

  const { count: unread } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  const { count: responded } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("responded", true);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-fixed rounded-xl shadow-sm">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface">Contact Messages</h1>
              <p className="text-on-surface-variant mt-1 font-medium">Manage reader inquiries and feedback</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Messages</p>
                  <p className="text-3xl font-bold text-on-surface mt-1">{total || 0}</p>
                </div>
                <Mail className="w-6 h-6 text-on-surface-variant opacity-50" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unread</p>
                  <p className="text-3xl font-bold text-error mt-1">{unread || 0}</p>
                </div>
                <MessageSquare className="w-6 h-6 text-on-surface-variant opacity-50" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Responded</p>
                  <p className="text-3xl font-bold text-[green] mt-1">{responded || 0}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-on-surface-variant opacity-50" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Today</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {messages?.filter(m => 
                      new Date(m.created_at).toDateString() === new Date().toDateString()
                    ).length || 0}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-on-surface-variant opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
          <MessagesTable initialMessages={messages || []} />
        </div>
      </div>
    </div>
  );
}