"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {};
    
  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <input type="text" placeholder="Full Name" required />
            <input type="date" placeholder="Date of Birth" />
            <input type="tel" placeholder="Phone Number" />
          </>
        )}

        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 border rounded"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
            ? "Sign In"
            : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "signin" ? (
          <>
            Don’t have an account?{" "}
            <button onClick={() => setMode("signup")} className="underline">
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button onClick={() => setMode("signin")} className="underline">
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
