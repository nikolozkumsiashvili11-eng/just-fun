"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { use } from "react";

const supabaseUrl = "https://lvgancuxiogylgsipvxs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z2FuY3V4aW9neWxnc2lwdnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3ODc5MDMsImV4cCI6MjA4ODM2MzkwM30.1cPop4exePi0V6PS1cR2A7t6_qbCGCh23J1WiE_UqeU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlacePage({ params }: { params: Promise<{ id: string }> }) {
    const [place, setPlace] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const resolvedParams = use(params);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const fetchData = async () => {
            const { data: placeData } = await supabase.from('places').select('*').eq('id', resolvedParams.id).single();
            const { data: reviewsData } = await supabase.from('reviews').select('*').eq('place_id', resolvedParams.id).order('created_at', { ascending: false });

            setPlace(placeData);
            setReviews(reviewsData || []);
            setLoading(false);
        };
        fetchData();
    }, [resolvedParams.id]);

    const submitReview = async () => {
        if (!user || !comment.trim()) return;
        setSubmitting(true);

        const newReview = { place_id: resolvedParams.id, user_id: user.id, rating, comment };
        await supabase.from('reviews').insert([newReview]);

        const { data: reviewsData } = await supabase.from('reviews').select('*').eq('place_id', resolvedParams.id).order('created_at', { ascending: false });
        setReviews(reviewsData || []);

        setComment("");
        setRating(5);
        setSubmitting(false);
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F8FAFF" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: "4px solid #E2E8F0", borderTopColor: "#2563EB", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!place) return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>Place not found</div>;

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFF", minHeight: "100vh", color: "#1a1a2e", paddingBottom: 60 }}>
            {/* HEADER */}
            <div style={{ background: "white", padding: "20px 40px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", alignItems: "center" }}>
                <button onClick={() => window.location.href = '/'} style={{ background: "transparent", border: "none", color: "#2563EB", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>←</span> Back to Places
                </button>
            </div>

            <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
                {/* PLACE INFO */}
                <div style={{ background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,80,0.08)", marginBottom: 40 }}>
                    <div style={{ background: "#E8F4FD", height: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96 }}>
                        {place.emoji}
                    </div>
                    <div style={{ padding: "40px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 36, color: "#1E3A8A" }}>{place.name}</h1>
                            <div style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 12, padding: "8px 16px", fontSize: 14, fontWeight: 700 }}>
                                {place.category}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 20, marginBottom: 24, color: "#64748B", fontSize: 15 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ color: "#F59E0B", fontSize: 18 }}>★</span>
                                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{place.rating}</span>
                                <span>({place.reviews_count} reviews)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                📍 {place.address}
                            </div>
                        </div>

                        <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.6, margin: 0 }}>{place.description}</p>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div style={{ background: "white", borderRadius: 24, padding: "40px", boxShadow: "0 10px 40px rgba(0,0,80,0.08)" }}>
                    <h2 style={{ margin: "0 0 30px", fontWeight: 800, fontSize: 24, color: "#1E3A8A" }}>Reviews</h2>

                    {/* ADD REVIEW */}
                    <div style={{ background: "#F8FAFF", borderRadius: 16, padding: 24, marginBottom: 40, border: "1px solid #E2E8F0" }}>
                        {user ? (
                            <div>
                                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1E3A8A" }}>Leave a Review</h3>
                                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{ background: "transparent", border: "none", fontSize: 24, cursor: "pointer", color: star <= rating ? "#F59E0B" : "#E2E8F0", padding: 0 }}
                                        >★</button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    style={{ width: "100%", padding: 16, borderRadius: 12, border: "2px solid #E2E8F0", outline: "none", fontSize: 15, minHeight: 100, marginBottom: 16, resize: "vertical", boxSizing: "border-box" }}
                                />
                                <button
                                    onClick={submitReview}
                                    disabled={submitting || !comment.trim()}
                                    style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: submitting || !comment.trim() ? "#94A3B8" : "#2563EB", color: "white", fontWeight: 700, cursor: submitting || !comment.trim() ? "not-allowed" : "pointer", fontSize: 15 }}
                                >
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <p style={{ margin: "0 0 16px", color: "#64748B" }}>Please sign in to leave a review</p>
                                <a href="/auth" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, background: "#2563EB", color: "white", textDecoration: "none", fontWeight: 600 }}>Sign In</a>
                            </div>
                        )}
                    </div>

                    {/* REVIEWS LIST */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {reviews.length === 0 ? (
                            <p style={{ color: "#94A3B8", textAlign: "center", margin: 0 }}>No reviews yet. Be the first!</p>
                        ) : (
                            reviews.map((review, i) => (
                                <div key={review.id} style={{ borderBottom: i !== reviews.length - 1 ? "1px solid #E2E8F0" : "none", paddingBottom: i !== reviews.length - 1 ? 20 : 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontWeight: 700 }}>
                                            👤
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", color: "#F59E0B", fontSize: 14 }}>
                                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#94A3B8" }}>User {review.user_id.substring(0, 8)}</div>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.5 }}>{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
