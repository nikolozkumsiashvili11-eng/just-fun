"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvgancuxiogylgsipvxs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z2FuY3V4aW9neWxnc2lwdnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3ODc5MDMsImV4cCI6MjA4ODM2MzkwM30.1cPop4exePi0V6PS1cR2A7t6_qbCGCh23J1WiE_UqeU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const getFriendlyError = (message: string): string => {
        const msg = message.toLowerCase();
        if (msg.includes("rate limit") || msg.includes("email rate limit") || msg.includes("over_email_send_rate_limit") || msg.includes("too many requests")) {
            return "Our registration system is temporarily at capacity. Please try again in a few minutes. If this keeps happening, contact support.";
        }
        if (msg.includes("user already registered") || msg.includes("already been registered")) {
            return "An account with this email already exists. Try signing in instead.";
        }
        if (msg.includes("invalid email")) {
            return "Please enter a valid email address.";
        }
        if (msg.includes("password") && msg.includes("weak")) {
            return "Password is too weak. Use at least 6 characters.";
        }
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
            return "Incorrect email or password. Please try again.";
        }
        if (msg.includes("email not confirmed")) {
            return "Please check your email inbox and confirm your email before signing in.";
        }
        return message;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(getFriendlyError(error.message));
            } else {
                setMessage("Welcome back! Redirecting...");
                setTimeout(() => window.location.href = "/", 1000);
            }
        } else {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) {
                setError(getFriendlyError(signUpError.message));
            } else {
                // Automatically sign in the user after successful registration
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    setError(getFriendlyError(signInError.message));
                } else {
                    setMessage("Account created and logged in! Redirecting...");
                    setTimeout(() => window.location.href = "/", 1000);
                }
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1E3A8A, #2563EB, #60A5FA)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: "white", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                    <h1 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 28, color: "#1E3A8A" }}>Just Fun</h1>
                    <p style={{ color: "#64748B", margin: 0, fontSize: 15 }}>Find your perfect fun place today</p>
                </div>

                <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 28 }}>
                    <button onClick={() => { setIsLogin(true); setError(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: isLogin ? "white" : "transparent", color: isLogin ? "#2563EB" : "#94A3B8", boxShadow: isLogin ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>Sign In</button>
                    <button onClick={() => { setIsLogin(false); setError(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: !isLogin ? "white" : "transparent", color: !isLogin ? "#2563EB" : "#94A3B8", boxShadow: !isLogin ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>Register</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email address"
                        type="email"
                        style={{ padding: "14px 18px", borderRadius: 12, border: "2px solid #E2E8F0", outline: "none", fontSize: 15, transition: "border-color 0.2s" }}
                        onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                        onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                    />
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        style={{ padding: "14px 18px", borderRadius: 12, border: "2px solid #E2E8F0", outline: "none", fontSize: 15, transition: "border-color 0.2s" }}
                        onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                        onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                    />

                    {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500 }}>⚠️ {error}</div>}
                    {message && <div style={{ background: "#F0FFF4", color: "#16A34A", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500 }}>✅ {message}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        style={{
                            marginTop: 8, padding: "16px", borderRadius: 12, border: "none",
                            background: loading || !email || !password ? "#94A3B8" : "#2563EB",
                            color: "white", fontWeight: 700, fontSize: 16,
                            cursor: loading || !email || !password ? "not-allowed" : "pointer",
                            boxShadow: loading || !email || !password ? "none" : "0 4px 12px rgba(37,99,235,0.3)",
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                    </button>
                </div>

                <p style={{ textAlign: "center", marginTop: 24, fontSize: 15 }}>
                    <a href="/" style={{ color: "#64748B", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#2563EB"} onMouseOut={e => e.currentTarget.style.color = "#64748B"}>← Back to Home</a>
                </p>
            </div>
        </div>
    );
}
