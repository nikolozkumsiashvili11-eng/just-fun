"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
    "https://gpawpzohojdephhlntls.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs"
);

function StarRating({
    value,
    onChange,
    size = 20,
    interactive = false,
}: {
    value: number;
    onChange?: (v: number) => void;
    size?: number;
    interactive?: boolean;
}) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    onClick={() => interactive && onChange?.(s)}
                    onMouseEnter={() => interactive && setHover(s)}
                    onMouseLeave={() => interactive && setHover(0)}
                    style={{
                        fontSize: size,
                        cursor: interactive ? "pointer" : "default",
                        color: s <= (hover || value) ? "#fbbf24" : "#334155",
                        transition: "color 0.15s, transform 0.15s",
                        transform: interactive && s <= (hover || value) ? "scale(1.15)" : "scale(1)",
                        userSelect: "none",
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function PlacePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [place, setPlace] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        supabase
            .from("places")
            .select("*")
            .eq("id", params.id)
            .single()
            .then(({ data }) => {
                setPlace(data);
                setLoading(false);
            });
        supabase
            .from("reviews")
            .select("*")
            .eq("place_id", params.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => setReviews(data || []));
    }, [params.id]);

    async function handleSubmit() {
        if (!user || !comment.trim()) return;
        setSubmitting(true);
        await supabase.from("reviews").insert({
            place_id: params.id,
            user_id: user.id,
            rating,
            comment: comment.trim(),
        });
        const { data } = await supabase
            .from("reviews")
            .select("*")
            .eq("place_id", params.id)
            .order("created_at", { ascending: false });
        setReviews(data || []);
        setComment("");
        setRating(5);
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    }

    const avg =
        reviews.length > 0
            ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
            : null;

    if (loading)
        return (
            <div style={styles.loadingWrap}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div style={styles.spinner} />
                <span style={{ color: "#94a3b8", fontSize: 14 }}>იტვირთება...</span>
            </div>
        );

    if (!place)
        return (
            <div style={styles.loadingWrap}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🗺️</div>
                <h2 style={{ color: "#e2e8f0", margin: "0 0 8px" }}>ადგილი ვერ მოიძებნა</h2>
                <p style={{ color: "#64748b", margin: "0 0 24px" }}>ეს ადგილი არ არსებობს ან წაშლილია.</p>
                <button onClick={() => router.push("/")} style={styles.primaryBtn}>
                    ← მთავარ გვერდზე
                </button>
            </div>
        );

    return (
        <div style={{ background: "#0b1120", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hover-lift{transition:transform .2s,box-shadow .2s}
        .hover-lift:hover{transform:translateY(-2px)!important;box-shadow:0 8px 30px rgba(99,102,241,.35)!important}
        .review-row{transition:background .2s;border-radius:16px}
        .review-row:hover{background:rgba(255,255,255,.03)}
        textarea:focus{border-color:#818cf8!important;box-shadow:0 0 0 3px rgba(129,140,248,.12)!important}
      `}</style>

            {/* ════════ HERO ════════ */}
            <div style={{ position: "relative", height: 400, overflow: "hidden" }}>
                {place.image_url ? (
                    <img
                        src={place.image_url}
                        alt={place.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(135deg, #1e1b4b, #312e81, #4f46e5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 110,
                        }}
                    >
                        🎉
                    </div>
                )}

                {/* overlays */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0b1120 0%, rgba(11,17,32,.65) 50%, rgba(11,17,32,.2) 100%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(11,17,32,.55), transparent 60%)" }} />

                {/* back button */}
                <button
                    onClick={() => router.push("/")}
                    style={{
                        position: "absolute",
                        top: 24,
                        left: 28,
                        zIndex: 10,
                        padding: "10px 20px",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,.15)",
                        background: "rgba(255,255,255,.08)",
                        backdropFilter: "blur(16px)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "background .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.18)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
                >
                    ← უკან
                </button>

                {/* hero text */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 40px 36px", zIndex: 10 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                        {place.category && (
                            <span style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", borderRadius: 10, padding: "5px 16px", fontSize: 13, fontWeight: 700 }}>
                                {place.category}
                            </span>
                        )}
                        {place.age_group && (
                            <span style={{ background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", borderRadius: 10, padding: "5px 16px", fontSize: 13, fontWeight: 600 }}>
                                {place.age_group}
                            </span>
                        )}
                    </div>
                    <h1 style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 40, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
                        {place.name}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <StarRating value={Math.round(Number(avg || place.rating || 0))} size={18} />
                        <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>
                            {avg || place.rating || "—"}
                        </span>
                        <span style={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>
                            ({reviews.length} შეფასება)
                        </span>
                    </div>
                </div>
            </div>

            {/* ════════ CONTENT ════════ */}
            <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px 80px" }}>

                {/* ── Info Card ── */}
                <div style={{ ...styles.card, marginTop: -36, position: "relative", zIndex: 20, animation: "fadeIn .5s ease both" }}>
                    {/* chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                        {place.address && (
                            <div style={styles.chip}>
                                <span>📍</span> {place.address}
                            </div>
                        )}
                        {place.phone && (
                            <div style={styles.chip}>
                                <span>📞</span> {place.phone}
                            </div>
                        )}
                        {place.website && (
                            <a href={place.website} target="_blank" rel="noopener noreferrer" style={{ ...styles.chip, color: "#a5b4fc", borderColor: "rgba(99,102,241,.25)", background: "rgba(99,102,241,.1)", textDecoration: "none", fontWeight: 600 }}>
                                🌐 ვებსაიტი
                            </a>
                        )}
                    </div>

                    {/* description */}
                    <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.85, margin: 0 }}>
                        {place.description}
                    </p>

                    {/* hours */}
                    <div style={{ marginTop: 28, padding: "20px 24px", background: "rgba(255,255,255,.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🕐</div>
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>სამუშაო საათები</h3>
                        </div>
                        {place.hours ? (
                            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0, lineHeight: 1.8 }}>{place.hours}</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {[["ორშაბათი – პარასკევი", "09:00 – 18:00"], ["შაბათი", "10:00 – 16:00"], ["კვირა", "დაკეტილია"]].map(([d, t]) => (
                                    <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                                        <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 500 }}>{d}</span>
                                        <span style={{ color: "#818cf8", fontSize: 14, fontWeight: 600 }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Reviews ── */}
                <div style={{ ...styles.card, animation: "fadeIn .5s ease .15s both" }}>
                    {/* header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#f1f5f9" }}>შეფასებები</h2>
                        </div>
                        {reviews.length > 0 && (
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{avg}</div>
                                <StarRating value={Math.round(Number(avg))} size={14} />
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{reviews.length} შეფასება</div>
                            </div>
                        )}
                    </div>

                    {/* form area */}
                    <div style={{ background: "rgba(99,102,241,.06)", borderRadius: 20, padding: "28px 30px", marginBottom: 32, border: "1px solid rgba(99,102,241,.12)" }}>
                        {user ? (
                            <>
                                <h3 style={{ margin: "0 0 18px", fontSize: 16, color: "#e2e8f0", fontWeight: 700 }}>✍️ დაწერე შეფასება</h3>

                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>რეიტინგი</div>
                                    <StarRating value={rating} onChange={setRating} size={32} interactive />
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>კომენტარი</div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="გაგვიზიარე შენი გამოცდილება..."
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            borderRadius: 14,
                                            border: "2px solid rgba(255,255,255,.06)",
                                            outline: "none",
                                            fontSize: 15,
                                            minHeight: 110,
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            lineHeight: 1.7,
                                            color: "#e2e8f0",
                                            background: "rgba(0,0,0,.25)",
                                            transition: "border-color .2s, box-shadow .2s",
                                        }}
                                    />
                                </div>

                                {success && (
                                    <div style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 14, color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
                                        ✓ შეფასება წარმატებით გაიგზავნა!
                                    </div>
                                )}

                                <button
                                    className="hover-lift"
                                    onClick={handleSubmit}
                                    disabled={submitting || !comment.trim()}
                                    style={{
                                        padding: "13px 30px",
                                        borderRadius: 14,
                                        border: "none",
                                        background: submitting || !comment.trim() ? "rgba(255,255,255,.04)" : "linear-gradient(135deg,#6366f1,#818cf8)",
                                        color: submitting || !comment.trim() ? "#475569" : "#fff",
                                        fontWeight: 700,
                                        cursor: submitting || !comment.trim() ? "not-allowed" : "pointer",
                                        fontSize: 15,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        boxShadow: submitting || !comment.trim() ? "none" : "0 4px 20px rgba(99,102,241,.3)",
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />
                                            იგზავნება...
                                        </>
                                    ) : (
                                        "გაგზავნა"
                                    )}
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", padding: "12px 0" }}>
                                <div style={{ fontSize: 42, marginBottom: 12 }}>🔐</div>
                                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>შეფასებისთვის შედი სისტემაში</p>
                                <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>გაუზიარე შენი გამოცდილება სხვებს</p>
                                <a href="/auth" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
                                    შესვლა / რეგისტრაცია
                                </a>
                            </div>
                        )}
                    </div>

                    {/* reviews list */}
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <div style={{ fontSize: 42, marginBottom: 12 }}>💬</div>
                            <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>ჯერ არავის დაუწერია შეფასება — იყავი პირველი!</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {reviews.map((r, i) => (
                                <div key={r.id} className="review-row" style={{ padding: "18px 22px", animation: `fadeIn .4s ease ${i * 0.05}s both` }}>
                                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 14,
                                                background: `linear-gradient(135deg, hsl(${(r.user_id?.charCodeAt(0) || 0) * 37 % 360},50%,50%), hsl(${((r.user_id?.charCodeAt(0) || 0) * 37 + 40) % 360},50%,60%))`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 800,
                                                fontSize: 17,
                                                color: "#fff",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {(r.user_id || "U")[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                                <StarRating value={r.rating} size={15} />
                                                {r.created_at && (
                                                    <span style={{ color: "#64748b", fontSize: 13 }}>
                                                        {new Date(r.created_at).toLocaleDateString("ka-GE", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, color: "#cbd5e1", fontSize: 15, lineHeight: 1.7 }}>{r.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══ Shared Styles ═══ */
const styles: Record<string, React.CSSProperties> = {
    loadingWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0b1120",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        gap: 14,
    },
    spinner: {
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "4px solid rgba(255,255,255,.08)",
        borderTopColor: "#818cf8",
        animation: "spin .8s linear infinite",
    },
    primaryBtn: {
        padding: "12px 28px",
        borderRadius: 14,
        border: "none",
        background: "linear-gradient(135deg,#6366f1,#818cf8)",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 15,
    },
    card: {
        background: "linear-gradient(145deg,#161e2e,#131a28)",
        borderRadius: 24,
        padding: "32px 36px",
        border: "1px solid rgba(255,255,255,.05)",
        boxShadow: "0 16px 48px rgba(0,0,0,.25)",
        marginTop: 24,
    },
    chip: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 12,
        padding: "9px 16px",
        fontSize: 14,
        color: "#cbd5e1",
    },
};
