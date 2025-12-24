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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Mail className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
              <p className="text-gray-600">Manage reader inquiries and feedback</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{total || 0}</p>
                </div>
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-700">{unread || 0}</p>
                </div>
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-green-700">{responded || 0}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {messages?.filter(m => 
                      new Date(m.created_at).toDateString() === new Date().toDateString()
                    ).length || 0}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <MessagesTable initialMessages={messages || []} />
        </div>
      </div>
    </div>
  );
}