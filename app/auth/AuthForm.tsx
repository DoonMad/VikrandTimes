"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
    const supabase  = createClient();

    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [name, setName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {

    }

    return(
        <div>
            <form onSubmit={handleSubmit}>

            </form>
        </div>
    )
}