"use client";
import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => onRate && setHovered(star)}
                    onMouseLeave={() => onRate && setHovered(0)}
                    style={{
                        background: "transparent", border: "none",
                        fontSize: onRate ? 32 : 18, cursor: onRate ? "pointer" : "default", padding: 0,
                        color: star <= (hovered || rating) ? "#F59E0B" : "#D1D5DB",
                        transition: "color 0.15s ease, transform 0.15s ease",
                        transform: onRate && star <= (hovered || rating) ? "scale(1.15)" : "scale(1)",
                    }}
                >★</button>
            ))}
        </div>
    );
}

function PhotoGallery({ photos, emoji }: { photos: string[]; emoji?: string }) {
    const [active, setActive] = useState(0);

    if (!photos || photos.length === 0) {
        return (
            <div style={{
                height: 340, background: "linear-gradient(135deg, #E8F4FD 0%, #DBEAFE 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 100, borderRadius: "20px 20px 0 0"
            }}>
                {emoji || "📍"}
            </div>
        );
    }

    return (
        <div style={{ position: "relative", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
            <img
                src={photos[active]}
                alt={`Photo ${active + 1}`}
                style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />

            {photos.length > 1 && (
                <>
                    <button
                        onClick={() => setActive(i => (i - 1 + photos.length) % photos.length)}
                        style={{
                            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                            width: 40, height: 40, borderRadius: "50%", border: "none",
                            background: "rgba(255,255,255,0.9)", color: "#1a1a2e",
                            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                        }}
                    >‹</button>
                    <button
                        onClick={() => setActive(i => (i + 1) % photos.length)}
                        style={{
                            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                            width: 40, height: 40, borderRadius: "50%", border: "none",
                            background: "rgba(255,255,255,0.9)", color: "#1a1a2e",
                            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                        }}
                    >›</button>
                </>
            )}

            {photos.length > 1 && (
                <div style={{
                    position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                    display: "flex", gap: 6
                }}>
                    {photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                width: i === active ? 20 : 8, height: 8, borderRadius: 4,
                                border: "none", background: i === active ? "white" : "rgba(255,255,255,0.5)",
                                cursor: "pointer", padding: 0, transition: "all 0.2s ease"
                            }}
                        />
                    ))}
                </div>
            )}

            <div style={{
                position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)",
                color: "white", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 600
            }}>
                {active + 1} / {photos.length}
            </div>
        </div>
    );
}

export default function PlacePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [place, setPlace] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const fetchData = async () => {
            const { data: placeData } = await supabase
                .from("places")
                .select("*")
                .eq("id", resolvedParams.id)
                .single();

            const { data: reviewsData } = await supabase
                .from("reviews")
                .select("*")
                .eq("place_id", resolvedParams.id)
                .order("created_at", { ascending: false });

            setPlace(placeData);
            setReviews(reviewsData || []);
            setLoading(false);
        };

        fetchData();
    }, [resolvedParams.id]);

    const submitReview = async () => {
        if (!user || !comment.trim()) return;
        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        const { error } = await supabase.from("reviews").insert([{
            place_id: resolvedParams.id,
            user_id: user.id,
            rating,
            comment: comment.trim(),
        }]);

        if (error) {
            setSubmitError(error.message);
            setSubmitting(false);
            return;
        }

        const { data: reviewsData } = await supabase
            .from("reviews")
            .select("*")
            .eq("place_id", resolvedParams.id)
            .order("created_at", { ascending: false });
        setReviews(reviewsData || []);
        setComment("");
        setRating(5);
        setSubmitSuccess(true);
        setSubmitting(false);
        setTimeout(() => setSubmitSuccess(false), 3000);
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const photos: string[] = (() => {
        if (!place) return [];
        if (place.photos) {
            try { return JSON.parse(place.photos); } catch { return [place.photos]; }
        }
        if (place.image_url) return [place.image_url];
        return [];
    })();

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F8FAFF", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: "4px solid #E2E8F0", borderTopColor: "#2563EB", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ color: "#64748B", fontSize: 15 }}>Loading place...</span>
        </div>
    );

    if (!place) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8FAFF", fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
            <h1 style={{ color: "#1E3A8A", margin: "0 0 8px" }}>Place not found</h1>
            <p style={{ color: "#64748B", marginBottom: 24 }}>This place doesn&#39;t exist or was removed.</p>
            <button onClick={() => window.location.href = "/"} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#2563EB", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                ← Back to Places
            </button>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFF", minHeight: "100vh", color: "#1a1a2e" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .review-card { animation: fadeIn 0.3s ease both; }
                .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
                .submit-btn { transition: all 0.2s ease; }
                .back-btn:hover { background: #EFF6FF !important; }
            `}</style>

            {/* NAVBAR */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 100,
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid #E2E8F0",
                padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🎉</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: "#2563EB", letterSpacing: "-0.5px" }}>Just Fun</span>
                </div>
                <button
                    className="back-btn"
                    onClick={() => window.location.href = "/"}
                    style={{
                        padding: "8px 18px", borderRadius: 10, border: "2px solid #E2E8F0",
                        background: "white", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: 14,
                        display: "flex", alignItems: "center", gap: 6
                    }}
                >
                    ← Back to Places
                </button>
            </nav>

            <div style={{ maxWidth: 860, margin: "40px auto", padding: "0 20px 80px" }}>

                {/* PLACE CARD */}
                <div style={{ background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 50px rgba(0,0,80,0.09)", marginBottom: 32 }}>
                    <PhotoGallery photos={photos} emoji={place.emoji} />

                    <div style={{ padding: "36px 40px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 34, color: "#1E3A8A", lineHeight: 1.1 }}>
                                {place.name}
                            </h1>
                            <div style={{ display: "flex", gap: 8 }}>
                                {place.category && (
                                    <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>
                                        {place.category}
                                    </span>
                                )}
                                {place.age_group && (
                                    <span style={{ background: "#F0FDF4", color: "#15803D", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>
                                        {place.age_group}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ display: "flex" }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <span key={s} style={{ color: s <= Math.round(Number(avgRating || place.rating || 0)) ? "#F59E0B" : "#D1D5DB", fontSize: 18 }}>★</span>
                                    ))}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: 18, color: "#1a1a2e" }}>
                                    {avgRating || place.rating || "—"}
                                </span>
                                <span style={{ color: "#94A3B8", fontSize: 14 }}>
                                    ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                                </span>
                            </div>
                            {place.address && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 15 }}>
                                    <span style={{ fontSize: 16 }}>📍</span> {place.address}
                                </div>
                            )}
                            {place.phone && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 15 }}>
                                    <span>📞</span> {place.phone}
                                </div>
                            )}
                            {place.website && (
                                <a href={place.website} target="_blank" rel="noopener noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563EB", fontSize: 15, textDecoration: "none", fontWeight: 600 }}>
                                    🌐 Website
                                </a>
                            )}
                        </div>

                        <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
                            {place.description}
                        </p>

                        {place.hours && (
                            <div style={{ marginTop: 24, padding: "16px 20px", background: "#FAFBFF", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                                <div style={{ fontWeight: 700, color: "#1E3A8A", marginBottom: 6, fontSize: 14 }}>⏰ Opening Hours</div>
                                <div style={{ color: "#475569", fontSize: 14 }}>{place.hours}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div style={{ background: "white", borderRadius: 24, padding: "40px", boxShadow: "0 10px 50px rgba(0,0,80,0.09)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 26, color: "#1E3A8A" }}>Reviews</h2>
                        {reviews.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: "#1E3A8A", lineHeight: 1 }}>{avgRating}</div>
                                <StarRating rating={Math.round(Number(avgRating))} />
                                <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
                            </div>
                        )}
                    </div>

                    {/* ADD REVIEW */}
                    <div style={{
                        background: "linear-gradient(135deg, #F8FAFF 0%, #EFF6FF 100%)",
                        borderRadius: 18, padding: "28px 30px", marginBottom: 36,
                        border: "1px solid #DBEAFE"
                    }}>
                        {user ? (
                            <div>
                                <h3 style={{ margin: "0 0 20px", fontSize: 17, color: "#1E3A8A", fontWeight: 700 }}>
                                    ✍️ Leave a Review
                                </h3>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>Your Rating</div>
                                    <StarRating rating={rating} onRate={setRating} />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>Your Comment</div>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Share your experience — what did you love? What could be better?"
                                        style={{
                                            width: "100%", padding: "14px 16px", borderRadius: 14,
                                            border: "2px solid #E2E8F0", outline: "none", fontSize: 15,
                                            minHeight: 110, resize: "vertical", boxSizing: "border-box",
                                            fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6,
                                            color: "#1a1a2e", background: "white",
                                            transition: "border-color 0.2s"
                                        }}
                                        onFocus={e => e.target.style.borderColor = "#2563EB"}
                                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                                    />
                                </div>

                                {submitError && (
                                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#DC2626", fontSize: 14 }}>
                                        {submitError}
                                    </div>
                                )}
                                {submitSuccess && (
                                    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#15803D", fontSize: 14, fontWeight: 600 }}>
                                        ✓ Review submitted! Thank you.
                                    </div>
                                )}

                                <button
                                    className="submit-btn"
                                    onClick={submitReview}
                                    disabled={submitting || !comment.trim()}
                                    style={{
                                        padding: "13px 30px", borderRadius: 12, border: "none",
                                        background: submitting || !comment.trim() ? "#CBD5E1" : "#2563EB",
                                        color: "white", fontWeight: 700, cursor: submitting || !comment.trim() ? "not-allowed" : "pointer",
                                        fontSize: 15, display: "flex", alignItems: "center", gap: 8
                                    }}
                                >
                                    {submitting ? (
                                        <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> Submitting...</>
                                    ) : "Submit Review"}
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "10px 0" }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                                <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#1E3A8A" }}>
                                    Sign in to leave a review
                                </p>
                                <p style={{ margin: "0 0 20px", color: "#64748B", fontSize: 14 }}>
                                    Share your experience with other visitors
                                </p>
                                <a
                                    href="/auth"
                                    style={{
                                        display: "inline-block", padding: "12px 28px", borderRadius: 12,
                                        background: "#2563EB", color: "white", textDecoration: "none",
                                        fontWeight: 700, fontSize: 15
                                    }}
                                >
                                    Sign In / Register
                                </a>
                            </div>
                        )}
                    </div>

                    {/* REVIEWS LIST */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                                <p style={{ color: "#94A3B8", margin: 0, fontSize: 15 }}>
                                    No reviews yet — be the first to share your experience!
                                </p>
                            </div>
                        ) : (
                            reviews.map((review, i) => (
                                <div
                                    key={review.id}
                                    className="review-card"
                                    style={{
                                        animationDelay: `${i * 0.04}s`,
                                        paddingBottom: i !== reviews.length - 1 ? 24 : 0,
                                        borderBottom: i !== reviews.length - 1 ? "1px solid #F1F5F9" : "none"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            background: `hsl(${(review.user_id?.charCodeAt(0) || 0) * 37 % 360}, 60%, 85%)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 700, fontSize: 18, color: "#1E3A8A", flexShrink: 0
                                        }}>
                                            {(review.user_id || "U")[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                                <div style={{ display: "flex" }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <span key={s} style={{ color: s <= review.rating ? "#F59E0B" : "#D1D5DB", fontSize: 15 }}>★</span>
                                                    ))}
                                                </div>
                                                {review.created_at && (
                                                    <span style={{ color: "#94A3B8", fontSize: 13 }}>
                                                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, color: "#374151", fontSize: 15, lineHeight: 1.6 }}>
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
