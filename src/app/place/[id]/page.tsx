"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
    "https://gpawpzohojdephhlntls.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs"
);

export default function PlacePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [place, setPlace] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlace();
        fetchReviews();
        fetchUser();
    }, []);

    async function fetchUser() {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
    }

    async function fetchPlace() {
        const { data } = await supabase.from("places").select("*").eq("id", params.id).single();
        setPlace(data);
        setLoading(false);
    }

    async function fetchReviews() {
        const { data } = await supabase.from("reviews").select("*").eq("place_id", params.id).order("created_at", { ascending: false });
        setReviews(data || []);
    }

    async function submitReview() {
        if (!user || !comment) return;
        await supabase.from("reviews").insert({ place_id: params.id, user_id: user.id, rating, comment });
        setComment("");
        fetchReviews();
    }

    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
    if (!place) return <div style={{ padding: 40, textAlign: "center" }}>ადგილი ვერ მოიძებნა</div>;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
            <button onClick={() => router.back()} style={{ marginBottom: 20, padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: 8, cursor: "pointer" }}>← უკან</button>
            <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 300, background: "#e8e8ff" }}>
                {place.image_url ? <img src={place.image_url} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 48 }}>🎉</div>}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{place.name}</h1>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{place.category}</span>
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>★ {place.rating}</span>
            </div>
            <p style={{ fontSize: 16, color: "#444", lineHeight: 1.6, marginBottom: 32 }}>{place.description}</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>შეფასებები ({reviews.length})</h2>
            {user ? (
                <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <div style={{ marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setRating(star)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", opacity: star <= rating ? 1 : 0.3 }}>★</button>)}
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="დაწერე კომენტარი..." style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, minHeight: 80, boxSizing: "border-box" }} />
                    <button onClick={submitReview} style={{ marginTop: 12, padding: "10px 24px", background: "#2563EB", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>გაგზავნა</button>
                </div>
            ) : (
                <div style={{ background: "#fff3cd", borderRadius: 12, padding: 16, marginBottom: 24 }}>შეფასებისთვის <a href="/auth" style={{ color: "#2563EB" }}>შედი სისტემაში</a></div>
            )}
            {reviews.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#f59e0b" }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ opacity: s <= r.rating ? 1 : 0.3 }}>★</span>)}</span>
                        <span style={{ color: "#999", fontSize: 13 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, color: "#333", fontSize: 15 }}>{r.comment}</p>
                </div>
            ))}
        </div>
    );
}
