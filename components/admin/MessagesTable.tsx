// components/admin/MessagesTable.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  responded: boolean;
  response_notes?: string;
}

interface MessagesTableProps {
  initialMessages: Message[];
}

export default function MessagesTable({ initialMessages }: MessagesTableProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "responded">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !message.is_read) ||
      (filter === "responded" && message.responded);

    return matchesSearch && matchesFilter;
  });

  // Mark as read
  const markAsRead = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } else {
      setError(error.message);
    }
    setLoading(false);
  };

  // Mark as responded
  const markAsResponded = async (id: string, notes?: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({
        responded: true,
        response_notes: notes,
        is_read: true,
      })
      .eq("id", id);

    if (!error) {
      setMessages(
        messages.map((msg) =>
          msg.id === id
            ? { ...msg, responded: true, response_notes: notes, is_read: true }
            : msg
        )
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          responded: true,
          response_notes: notes,
          is_read: true,
        });
      }
    }
    setLoading(false);
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setLoading(true);

    try {
      // Using .delete() method with error handling
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        alert(`Failed to delete message: ${error.message}`);
        return;
      }

      // Update local state
      setMessages(messages.filter((msg) => msg.id !== id));

      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }

      // Optional: Show success message
      console.log("Message deleted successfully");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Failed to delete message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Messages List */}
      <div className="lg:w-2/3 border-r border-gray-200">
        {/* Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === "unread"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter("responded")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === "responded"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Responded
              </button>
            </div>
          </div>
        </div>

        {error && <p className="p-1 bg-red-200 text-red-800">{error}</p>}

        {/* Messages */}
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? "bg-red-50" : ""
                  } ${!message.is_read ? "bg-blue-50 hover:bg-blue-100" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {message.name}
                        </h3>
                        {!message.is_read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        {message.responded && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Responded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {message.message.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.created_at), "MMM d, h:mm a")}
                      </span>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(message.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={
                            message.is_read ? "Mark as unread" : "Mark as read"
                          }
                        >
                          {message.is_read ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="lg:w-1/3">
        {selectedMessage ? (
          <div className="p-6 h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Message Details
                </h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    From
                  </label>
                  <p className="mt-1 text-gray-900">{selectedMessage.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Received
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(selectedMessage.created_at), "PPpp")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.response_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Response Notes
                    </label>
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      {selectedMessage.response_notes}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {!selectedMessage.is_read && (
                      <button
                        onClick={() => markAsRead(selectedMessage.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark as Read
                      </button>
                    )}

                    {!selectedMessage.responded && (
                      <button
                        onClick={() => {
                          const notes = prompt(
                            "Add response notes (optional):"
                          );
                          if (notes !== null) {
                            markAsResponded(selectedMessage.id, notes);
                          }
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Responded
                      </button>
                    )}

                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
            <div>
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a message to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
