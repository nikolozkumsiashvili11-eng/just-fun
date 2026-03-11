"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gpawpzohojdephhlntls.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs";
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = ["All", "Kids", "Adults", "All Ages", "Family", "Nightlife", "Sports"];

export default function Home() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [aiOpen, setAiOpen] = useState(false);
    const [aiMessage, setAiMessage] = useState("");
    const [aiChat, setAiChat] = useState<{ role: string, text: string }[]>([
        { role: "ai", text: "Hi there! 👋 I'm the Just Fun AI assistant. Ask me anything about fun places to visit!" }
    ]);
    const [aiLoading, setAiLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [places, setPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchPlaces = async () => {
            setFetchError(null);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Supabase fetch error:', error);
                setFetchError(error.message);
            }
            if (data && data.length > 0) {
                const colors = ["#E8F4FD", "#EDF2FF", "#F0FFF4", "#FFF5F5", "#FFFBEB", "#F3F0FF"];
                setPlaces(data.map((p, i) => ({ ...p, color: colors[i % colors.length] })));
            }
            setLoading(false);
        };
        fetchPlaces();
    }, []);

    const filtered = places.filter(p => {
        const matchCat = activeCategory === "All" || p.category === activeCategory || p.age_group === activeCategory;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });

    const sendAiMessage = async () => {
        if (!aiMessage.trim()) return;
        const userMsg = aiMessage;
        setAiMessage("");
        setAiChat(prev => [...prev, { role: "user", text: userMsg }]);
        setAiLoading(true);
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: "You are the AI assistant for Just Fun, a website where users discover fun entertainment places in Georgia — bars, kids entertainment centers, cinemas, sports centers, and more. Reply briefly and in a friendly tone in English.",
                    messages: [{ role: "user", content: userMsg }]
                })
            });
            const data = await response.json();
            const aiReply = data.content?.[0]?.text || "Sorry, I couldn't respond.";
            setAiChat(prev => [...prev, { role: "ai", text: aiReply }]);
        } catch {
            setAiChat(prev => [...prev, { role: "ai", text: "Connection error. Please try again later." }]);
        }
        setAiLoading(false);
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFF", minHeight: "100vh", color: "#1a1a2e" }}>

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                boxShadow: scrolled ? "0 2px 20px rgba(0,0,80,0.08)" : "none",
                transition: "all 0.3s ease",
                padding: "16px 40px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🎉</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: "#2563EB", letterSpacing: "-0.5px" }}>Just Fun</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => window.location.href = '/auth'} style={{ padding: "8px 20px", borderRadius: 10, border: "2px solid #2563EB", background: "white", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Sign In</button>
                    <button onClick={() => window.location.href = '/auth'} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#2563EB", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Register</button>
                </div>
            </nav>

            {/* HERO */}
            <div style={{
                background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)",
                minHeight: "70vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: "120px 20px 80px",
                position: "relative", overflow: "hidden"
            }}>
                <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 30, padding: "6px 18px", marginBottom: 20 }}>
                        <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>🇬🇪 Entertainment spots in Georgia</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 900, color: "white", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-2px" }}>
                        Find your perfect<br />
                        <span style={{ color: "#BAE6FD" }}>fun place today</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, marginBottom: 40, maxWidth: 500 }}>
                        Bars, entertainment centers, kids' spaces and more — all in one place
                    </p>

                    <div style={{ display: "flex", gap: 12, maxWidth: 560, margin: "0 auto", background: "white", borderRadius: 16, padding: "8px 8px 8px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="🔍  Search for a place..."
                            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, background: "transparent", color: "#1a1a2e" }}
                        />
                        <button
                            onClick={() => document.getElementById('places-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                padding: "12px 28px", borderRadius: 12, border: "none",
                                background: "#2563EB", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 15
                            }}>Search</button>
                    </div>
                </div>
            </div>

            {/* CATEGORIES */}
            <div style={{ padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 22px", borderRadius: 30,
                                border: activeCategory === cat ? "none" : "2px solid #E2E8F0",
                                background: activeCategory === cat ? "#2563EB" : "white",
                                color: activeCategory === cat ? "white" : "#64748B",
                                fontWeight: 600, cursor: "pointer", fontSize: 14,
                                transition: "all 0.2s ease",
                                boxShadow: activeCategory === cat ? "0 4px 15px rgba(37,99,235,0.3)" : "none"
                            }}
                        >{cat}</button>
                    ))}
                </div>
            </div>

            {/* PLACES GRID */}
            <div id="places-grid" style={{ padding: "30px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24, color: "#1E3A8A" }}>
                    {filtered.length} place{filtered.length !== 1 ? "s" : ""} found
                </h2>
                {fetchError && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 24, color: "#DC2626", fontSize: 14 }}>
                        <strong>Failed to load places:</strong> {fetchError}
                        <br /><span style={{ color: "#B91C1C", fontSize: 12 }}>Tip: check Supabase RLS — add a public SELECT policy on the <code>places</code> table.</span>
                    </div>
                )}
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #E2E8F0", borderTopColor: "#2563EB", animation: "spin 1s linear infinite" }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                        {filtered.map(place => (
                            <div key={place.id} onClick={() => window.location.href = `/place/${place.id}`} style={{
                                background: "white", borderRadius: 20, overflow: "hidden",
                                boxShadow: "0 4px 20px rgba(0,0,80,0.06)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                cursor: "pointer"
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,80,0.12)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,80,0.06)";
                                }}>
                                <div style={{ background: place.color || "#E8F4FD", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, overflow: "hidden" }}>
                                    {place.image_url ? (
                                        <img src={place.image_url} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        place.emoji
                                    )}
                                </div>
                                <div style={{ padding: "20px 24px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#1E3A8A" }}>{place.name}</h3>
                                        <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
                                            {place.age_group}
                                        </span>
                                    </div>
                                    <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 14px", lineHeight: 1.5 }}>{place.description}</p>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ color: "#F59E0B", fontSize: 16 }}>★</span>
                                            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{place.rating}</span>
                                            <span style={{ color: "#94A3B8", fontSize: 13 }}>({place.reviews_count} reviews)</span>
                                        </div>
                                        <span style={{ fontSize: 12, color: "#94A3B8", background: "#F8FAFF", padding: "4px 10px", borderRadius: 8 }}>
                                            {place.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI CHAT BUTTON */}
            <button
                onClick={() => setAiOpen(!aiOpen)}
                style={{
                    position: "fixed", bottom: 30, right: 30, width: 60, height: 60,
                    borderRadius: "50%", border: "none", background: "#2563EB",
                    color: "white", fontSize: 26, cursor: "pointer", zIndex: 200,
                    boxShadow: "0 8px 30px rgba(37,99,235,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
            >🤖</button>

            {/* AI CHAT WINDOW */}
            {aiOpen && (
                <div style={{
                    position: "fixed", bottom: 104, right: 30, width: 360, borderRadius: 20,
                    background: "white", boxShadow: "0 20px 60px rgba(0,0,80,0.15)", zIndex: 200, overflow: "hidden"
                }}>
                    <div style={{ background: "#2563EB", padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>🤖</span>
                        <div>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Just Fun AI</div>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Always ready to help</div>
                        </div>
                    </div>
                    <div style={{ height: 280, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        {aiChat.map((msg, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: msg.role === "user" ? "#2563EB" : "#F1F5F9",
                                    color: msg.role === "user" ? "white" : "#1a1a2e",
                                    fontSize: 14, lineHeight: 1.5
                                }}>{msg.text}</div>
                            </div>
                        ))}
                        {aiLoading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{ background: "#F1F5F9", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", color: "#94A3B8", fontSize: 14 }}>
                                    ⏳ Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 8 }}>
                        <input
                            value={aiMessage}
                            onChange={e => setAiMessage(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendAiMessage()}
                            placeholder="Type your question..."
                            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "2px solid #E2E8F0", outline: "none", fontSize: 14 }}
                        />
                        <button
                            onClick={sendAiMessage}
                            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#2563EB", color: "white", cursor: "pointer", fontSize: 18 }}
                        >➤</button>
                    </div>
                </div>
            )}
        </div>
    );
}
