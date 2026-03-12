"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
    "https://gpawpzohojdephhlntls.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs"
);

/* ─── Star Rating Component ─── */
function StarRating({
    rating,
    onRate,
    size = 22,
}: {
    rating: number;
    onRate?: (r: number) => void;
    size?: number;
}) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => onRate && setHovered(star)}
                    onMouseLeave={() => onRate && setHovered(0)}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: size,
                        cursor: onRate ? "pointer" : "default",
                        padding: 0,
                        color: star <= (hovered || rating) ? "#F59E0B" : "#D1D5DB",
                        transition: "color 0.2s, transform 0.2s",
                        transform:
                            onRate && star <= (hovered || rating)
                                ? "scale(1.2)"
                                : "scale(1)",
                    }}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

/* ─── Main Page ─── */
export default function PlacePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [place, setPlace] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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
        const { data } = await supabase
            .from("places")
            .select("*")
            .eq("id", params.id)
            .single();
        setPlace(data);
        setLoading(false);
    }

    async function fetchReviews() {
        const { data } = await supabase
            .from("reviews")
            .select("*")
            .eq("place_id", params.id)
            .order("created_at", { ascending: false });
        setReviews(data || []);
    }

    async function submitReview() {
        if (!user || !comment.trim()) return;
        setSubmitting(true);
        await supabase.from("reviews").insert({
            place_id: params.id,
            user_id: user.id,
            rating,
            comment: comment.trim(),
        });
        setComment("");
        setRating(5);
        setSubmitting(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
        fetchReviews();
    }

    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : null;

    /* ─── Loading ─── */
    if (loading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "4px solid rgba(255,255,255,0.1)",
                        borderTopColor: "#818cf8",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>
                    Loading place...
                </span>
            </div>
        );

    /* ─── Not Found ─── */
    if (!place)
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                }}
            >
                <div style={{ fontSize: 72, marginBottom: 16 }}>🗺️</div>
                <h1 style={{ color: "#f1f5f9", margin: "0 0 8px", fontSize: 28 }}>
                    ადგილი ვერ მოიძებნა
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 15 }}>
                    ეს ადგილი არ არსებობს ან წაშლილია.
                </p>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "12px 28px",
                        borderRadius: 12,
                        border: "none",
                        background: "linear-gradient(135deg, #6366f1, #818cf8)",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 15,
                    }}
                >
                    ← მთავარ გვერდზე
                </button>
            </div>
        );

    return (
        <div
            style={{
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                background: "#0f172a",
                minHeight: "100vh",
                color: "#e2e8f0",
            }}
        >
            <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .hero-btn:hover{background:rgba(255,255,255,0.25)!important;transform:scale(1.05)}
        .hero-btn{transition:all 0.2s ease}
        .detail-card{animation:fadeUp 0.5s ease both}
        .review-form textarea:focus{border-color:#818cf8!important;box-shadow:0 0 0 3px rgba(129,140,248,0.15)!important}
        .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(99,102,241,0.4)!important}
        .submit-btn{transition:all 0.25s ease}
        .review-item{animation:fadeUp 0.4s ease both}
        .review-item:hover{background:rgba(255,255,255,0.04)!important}
        .info-chip:hover{transform:translateY(-1px)}
        .info-chip{transition:transform 0.2s ease}
      `}</style>

            {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
            <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
                {/* Background Image */}
                {place.image_url ? (
                    <img
                        src={place.image_url}
                        alt={place.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background:
                                "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 120,
                        }}
                    >
                        🎉
                    </div>
                )}

                {/* Gradient Overlays */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.7) 40%, rgba(15,23,42,0.2) 70%, transparent 100%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to right, rgba(15,23,42,0.5) 0%, transparent 50%)",
                    }}
                />

                {/* Back Button */}
                <button
                    className="hero-btn"
                    onClick={() => router.push("/")}
                    style={{
                        position: "absolute",
                        top: 24,
                        left: 24,
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(12px)",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 10,
                    }}
                >
                    ← უკან
                </button>

                {/* Hero Content */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "0 48px 40px",
                        zIndex: 10,
                    }}
                >
                    {/* Badges */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                        {place.category && (
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                                    color: "white",
                                    borderRadius: 10,
                                    padding: "6px 16px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    letterSpacing: "0.3px",
                                }}
                            >
                                {place.category}
                            </span>
                        )}
                        {place.age_group && (
                            <span
                                style={{
                                    background: "rgba(255,255,255,0.15)",
                                    backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "white",
                                    borderRadius: 10,
                                    padding: "6px 16px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {place.age_group}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            margin: "0 0 12px",
                            fontWeight: 900,
                            fontSize: 42,
                            color: "white",
                            lineHeight: 1.1,
                            letterSpacing: "-1px",
                            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        {place.name}
                    </h1>

                    {/* Rating + Review Count */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <StarRating
                                rating={Math.round(Number(avgRating || place.rating || 0))}
                                size={20}
                            />
                            <span
                                style={{
                                    fontWeight: 800,
                                    fontSize: 18,
                                    color: "white",
                                    marginLeft: 4,
                                }}
                            >
                                {avgRating || place.rating || "—"}
                            </span>
                        </div>
                        <span
                            style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            ({reviews.length} შეფასებ{reviews.length !== 1 ? "ა" : "ა"})
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════ CONTENT ═══════════════════════ */}
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
                {/* ─── Details Card ─── */}
                <div
                    className="detail-card"
                    style={{
                        background: "linear-gradient(145deg, #1e293b, #1a2332)",
                        borderRadius: 24,
                        padding: "36px 40px",
                        marginTop: -40,
                        position: "relative",
                        zIndex: 20,
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        marginBottom: 28,
                    }}
                >
                    {/* Info Chips */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            marginBottom: 28,
                        }}
                    >
                        {place.address && (
                            <div
                                className="info-chip"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    fontSize: 14,
                                    color: "#cbd5e1",
                                }}
                            >
                                <span style={{ fontSize: 16 }}>📍</span>
                                {place.address}
                            </div>
                        )}
                        {place.phone && (
                            <div
                                className="info-chip"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    fontSize: 14,
                                    color: "#cbd5e1",
                                }}
                            >
                                <span style={{ fontSize: 16 }}>📞</span>
                                {place.phone}
                            </div>
                        )}
                        {place.website && (
                            <a
                                href={place.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-chip"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(99,102,241,0.15)",
                                    border: "1px solid rgba(99,102,241,0.25)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    fontSize: 14,
                                    color: "#a5b4fc",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                }}
                            >
                                🌐 ვებსაიტი
                            </a>
                        )}
                    </div>

                    {/* Description */}
                    <p
                        style={{
                            color: "#94a3b8",
                            fontSize: 16,
                            lineHeight: 1.8,
                            margin: 0,
                            letterSpacing: "0.1px",
                        }}
                    >
                        {place.description}
                    </p>
                </div>

                {/* ─── Opening Hours Card ─── */}
                <div
                    className="detail-card"
                    style={{
                        animationDelay: "0.1s",
                        background: "linear-gradient(145deg, #1e293b, #1a2332)",
                        borderRadius: 24,
                        padding: "28px 36px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        marginBottom: 28,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                            }}
                        >
                            🕐
                        </div>
                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>
                            სამუშაო საათები
                        </h3>
                    </div>

                    {place.hours ? (
                        <p style={{ color: "#94a3b8", fontSize: 15, margin: 0, lineHeight: 1.8 }}>
                            {place.hours}
                        </p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "8px 32px",
                                color: "#94a3b8",
                                fontSize: 14,
                            }}
                        >
                            {[
                                ["ორშაბათი – პარასკევი", "09:00 – 18:00"],
                                ["შაბათი", "10:00 – 16:00"],
                                ["კვირა", "დაკეტილია"],
                            ].map(([day, time]) => (
                                <div
                                    key={day}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "8px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{day}</span>
                                    <span style={{ color: "#818cf8", fontWeight: 600 }}>{time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════ REVIEWS SECTION ═══════════════════════ */}
                <div
                    className="detail-card"
                    style={{
                        animationDelay: "0.2s",
                        background: "linear-gradient(145deg, #1e293b, #1a2332)",
                        borderRadius: 24,
                        padding: "40px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 32,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 20,
                                }}
                            >
                                💬
                            </div>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 24, color: "#f1f5f9" }}>
                                შეფასებები
                            </h2>
                        </div>

                        {reviews.length > 0 && (
                            <div style={{ textAlign: "right" }}>
                                <div
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 900,
                                        color: "#f1f5f9",
                                        lineHeight: 1,
                                    }}
                                >
                                    {avgRating}
                                </div>
                                <StarRating rating={Math.round(Number(avgRating))} size={16} />
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                    {reviews.length} შეფასება
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Review Form ─── */}
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(129,140,248,0.04))",
                            borderRadius: 20,
                            padding: "28px 32px",
                            marginBottom: 36,
                            border: "1px solid rgba(99,102,241,0.15)",
                        }}
                    >
                        {user ? (
                            <div>
                                <h3
                                    style={{
                                        margin: "0 0 20px",
                                        fontSize: 17,
                                        color: "#e2e8f0",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    ✍️ დაწერე შეფასება
                                </h3>

                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#94a3b8",
                                            marginBottom: 10,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        შენი რეიტინგი
                                    </div>
                                    <StarRating rating={rating} onRate={setRating} size={36} />
                                </div>

                                <div className="review-form" style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#94a3b8",
                                            marginBottom: 10,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        კომენტარი
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="გაგვიზიარე შენი გამოცდილება..."
                                        style={{
                                            width: "100%",
                                            padding: "16px 18px",
                                            borderRadius: 14,
                                            border: "2px solid rgba(255,255,255,0.08)",
                                            outline: "none",
                                            fontSize: 15,
                                            minHeight: 120,
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                            lineHeight: 1.7,
                                            color: "#e2e8f0",
                                            background: "rgba(0,0,0,0.2)",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                        }}
                                    />
                                </div>

                                {submitSuccess && (
                                    <div
                                        style={{
                                            background: "rgba(34,197,94,0.1)",
                                            border: "1px solid rgba(34,197,94,0.25)",
                                            borderRadius: 12,
                                            padding: "12px 16px",
                                            marginBottom: 16,
                                            color: "#4ade80",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        ✓ შეფასება წარმატებით გაიგზავნა!
                                    </div>
                                )}

                                <button
                                    className="submit-btn"
                                    onClick={submitReview}
                                    disabled={submitting || !comment.trim()}
                                    style={{
                                        padding: "14px 32px",
                                        borderRadius: 14,
                                        border: "none",
                                        background:
                                            submitting || !comment.trim()
                                                ? "rgba(255,255,255,0.05)"
                                                : "linear-gradient(135deg, #6366f1, #818cf8)",
                                        color:
                                            submitting || !comment.trim()
                                                ? "#475569"
                                                : "white",
                                        fontWeight: 700,
                                        cursor:
                                            submitting || !comment.trim() ? "not-allowed" : "pointer",
                                        fontSize: 15,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        boxShadow:
                                            submitting || !comment.trim()
                                                ? "none"
                                                : "0 4px 20px rgba(99,102,241,0.3)",
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <div
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: "50%",
                                                    border: "2px solid rgba(255,255,255,0.3)",
                                                    borderTopColor: "white",
                                                    animation: "spin 0.8s linear infinite",
                                                }}
                                            />
                                            იგზავნება...
                                        </>
                                    ) : (
                                        "გაგზავნა"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "16px 0" }}>
                                <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontWeight: 700,
                                        fontSize: 17,
                                        color: "#e2e8f0",
                                    }}
                                >
                                    შეფასებისთვის შედი სისტემაში
                                </p>
                                <p
                                    style={{
                                        margin: "0 0 22px",
                                        color: "#64748b",
                                        fontSize: 14,
                                    }}
                                >
                                    გაუზიარე შენი გამოცდილება სხვა მომხმარებლებს
                                </p>
                                <a
                                    href="/auth"
                                    style={{
                                        display: "inline-block",
                                        padding: "13px 30px",
                                        borderRadius: 14,
                                        background: "linear-gradient(135deg, #6366f1, #818cf8)",
                                        color: "white",
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        fontSize: 15,
                                        boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                                    }}
                                >
                                    შესვლა / რეგისტრაცია
                                </a>
                            </div>
                        )}
                    </div>

                    {/* ─── Reviews List ─── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "44px 0" }}>
                                <div style={{ fontSize: 44, marginBottom: 14 }}>💬</div>
                                <p
                                    style={{
                                        color: "#64748b",
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 500,
                                    }}
                                >
                                    ჯერ არავის დაუწერია შეფასება — იყავი პირველი!
                                </p>
                            </div>
                        ) : (
                            reviews.map((review, i) => (
                                <div
                                    key={review.id}
                                    className="review-item"
                                    style={{
                                        animationDelay: `${i * 0.06}s`,
                                        padding: "20px 24px",
                                        borderRadius: 16,
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 16,
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: 14,
                                                background: `linear-gradient(135deg, hsl(${(review.user_id?.charCodeAt(0) || 0) * 37 % 360
                                                    }, 55%, 55%), hsl(${((review.user_id?.charCodeAt(0) || 0) * 37 + 40) % 360
                                                    }, 55%, 65%))`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 800,
                                                fontSize: 18,
                                                color: "white",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {(review.user_id || "U")[0].toUpperCase()}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    marginBottom: 6,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <StarRating rating={review.rating} size={16} />
                                                {review.created_at && (
                                                    <span style={{ color: "#64748b", fontSize: 13 }}>
                                                        {new Date(review.created_at).toLocaleDateString(
                                                            "ka-GE",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: "#cbd5e1",
                                                    fontSize: 15,
                                                    lineHeight: 1.7,
                                                }}
                                            >
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
        </div >
    );
}
