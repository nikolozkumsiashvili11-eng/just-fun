"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useParams } from "next/navigation";

const supabaseUrl = "https://gpawpzohojdephhlntls.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs";

// Public client for reading data — never uses stored auth sessions
const supabasePublic = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// Auth-aware client for user operations (getUser, insert review)
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [place, setPlace] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabasePublic.from("places").select("*").eq("id", id).single().then(({ data }) => {
      setPlace(data);
      setLoading(false);
    });
    supabasePublic.from("reviews").select("*").eq("place_id", id).order("created_at", { ascending: false }).then(({ data }) => {
      setReviews(data || []);
    });
  }, [id]);

  async function submitReview() {
    if (!user || !comment || !id) return;
    setSubmitting(true);
    await supabase.from("reviews").insert({ place_id: id, user_id: user.id, rating, comment });
    setComment("");
    setRating(5);
    const { data } = await supabasePublic.from("reviews").select("*").eq("place_id", id).order("created_at", { ascending: false });
    setReviews(data || []);
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f8fafc"}}>
      <div style={{fontSize:18,color:"#64748b"}}>იტვირთება...</div>
    </div>
  );

  if (!place) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f8fafc"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🗺️</div>
        <div style={{fontSize:18,color:"#64748b",marginBottom:16}}>ადგილი ვერ მოიძებნა</div>
        <button onClick={() => router.back()} style={{padding:"10px 24px",background:"#3b82f6",color:"white",border:"none",borderRadius:12,cursor:"pointer"}}>← მთავარ გვერდზე</button>
      </div>
    </div>
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : place.rating;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"sans-serif"}}>
      <div style={{position:"relative",height:420,overflow:"hidden"}}>
        {place.image_url
          ? <img src={place.image_url} alt={place.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:80}}>🎉</div>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"}} />
        <button onClick={() => router.back()} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,0.2)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:50,width:44,height:44,cursor:"pointer",fontSize:18,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
        <div style={{position:"absolute",bottom:32,left:32,right:32}}>
          <span style={{background:"rgba(255,255,255,0.2)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"4px 14px",borderRadius:20,fontSize:13,marginBottom:12,display:"inline-block"}}>{place.category}</span>
          <h1 style={{fontSize:36,fontWeight:800,color:"white",margin:"8px 0",textShadow:"0 2px 4px rgba(0,0,0,0.3)"}}>{place.name}</h1>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fbbf24",fontSize:18}}>{"★".repeat(Math.round(Number(avgRating)))}</span>
            <span style={{color:"white",fontSize:16,fontWeight:600}}>{avgRating}</span>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>({reviews.length} შეფასება)</span>
          </div>
        </div>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:"32px 20px"}}>
        <div style={{background:"white",borderRadius:20,padding:28,marginBottom:24,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:12,color:"#1e293b"}}>აღწერა</h2>
          <p style={{fontSize:15,color:"#64748b",lineHeight:1.7,margin:0}}>{place.description}</p>
          {place.address && <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,color:"#64748b",fontSize:14}}><span>📍</span>{place.address}</div>}
        </div>
        <div style={{background:"white",borderRadius:20,padding:28,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:20,color:"#1e293b"}}>შეფასებები ({reviews.length})</h2>
          {user ? (
            <div style={{background:"#f8fafc",borderRadius:16,padding:20,marginBottom:24,border:"1px solid #e2e8f0"}}>
              <div style={{display:"flex",gap:4,marginBottom:12}}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",color:star<=(hoverRating||rating)?"#fbbf24":"#d1d5db"}}>★</button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="გაგვიზიარე შთაბეჭდილება..." style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1px solid #e2e8f0",fontSize:14,minHeight:100,resize:"vertical",boxSizing:"border-box",outline:"none",fontFamily:"sans-serif"}} />
              <button onClick={submitReview} disabled={submitting||!comment} style={{marginTop:12,padding:"12px 28px",background:!comment?"#94a3b8":"#3b82f6",color:"white",border:"none",borderRadius:12,cursor:!comment?"not-allowed":"pointer",fontSize:14,fontWeight:600}}>{submitting?"იგზავნება...":"გაგზავნა"}</button>
            </div>
          ) : (
            <div style={{background:"#eff6ff",borderRadius:16,padding:16,marginBottom:24,border:"1px solid #bfdbfe",fontSize:14,color:"#1d4ed8"}}>შეფასებისთვის <a href="/auth" style={{fontWeight:700,color:"#1d4ed8"}}>შედი სისტემაში</a></div>
          )}
          {reviews.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8"}}><div style={{fontSize:48,marginBottom:12}}>💬</div><p>ჯერ შეფასება არ არის!</p></div>
          ) : reviews.map(r => (
            <div key={r.id} style={{borderBottom:"1px solid #f1f5f9",paddingBottom:16,marginBottom:16}}>
              <div style={{color:"#fbbf24",fontSize:16,marginBottom:4}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
              <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6}}>{r.comment}</p>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>{new Date(r.created_at).toLocaleDateString("ka-GE")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}