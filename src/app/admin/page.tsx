"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://gpawpzohojdephhlntls.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXdwem9ob2pkZXBoaGxudGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzY0MzYsImV4cCI6MjA4ODcxMjQzNn0.xRmc0i6ALXKz20W3f_EKw2Pm0adOFbSlFe92LEzEqKs"
);

const CATEGORIES = ["Kids", "Family", "Nightlife", "Food", "Sports", "Adults", "All Ages"];

const empty = {
  name: "", description: "", category: "Kids", address: "", city: "",
  rating: "4", image_url: "",
};

export default function AdminPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error: err } = await supabase.from("places").insert({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      address: form.address.trim(),
      city: form.city.trim(),
      rating: parseFloat(form.rating),
      image_url: form.image_url.trim() || null,
    });

    if (err) {
      setError(err.message);
    } else {
      setSuccess(`✅ "${form.name}" added successfully!`);
      setForm(empty);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "2px solid #E2E8F0", outline: "none", fontSize: 15,
    fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontWeight: 600, fontSize: 14,
    color: "#374151", marginBottom: 6,
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF", fontFamily: "'Segoe UI', sans-serif", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ maxWidth: 640, margin: "0 auto 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <a href="/" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>← Back to site</a>
        </div>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, color: "#1E3A8A" }}>🛠️ Admin — Add Place</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: 15 }}>Fill in the details to add a new place to the database.</p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: "0 auto", background: "white", borderRadius: 20, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,80,0.07)" }}>

        <Field label="Place Name *">
          <input
            required value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g. Sky Bar Tbilisi"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </Field>

        <Field label="Description *">
          <textarea
            required value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="A short description of the place..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              value={form.category} onChange={e => set("category", e.target.value)}
              style={{ ...inputStyle, background: "white", cursor: "pointer" }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rating (1–5) *</label>
            <select
              value={form.rating} onChange={e => set("rating", e.target.value)}
              style={{ ...inputStyle, background: "white", cursor: "pointer" }}
            >
              {["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"].map(r => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Address</label>
            <input
              value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="e.g. 12 Rustaveli Ave"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#2563EB"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input
              value={form.city} onChange={e => set("city", e.target.value)}
              placeholder="e.g. Tbilisi"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#2563EB"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
        </div>

        <Field label="Image URL">
          <input
            value={form.image_url} onChange={e => set("image_url", e.target.value)}
            placeholder="https://example.com/photo.jpg (optional)"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </Field>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#F0FFF4", border: "1px solid #BBF7D0", color: "#16A34A", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? "#93C5FD" : "#2563EB", color: "white",
            fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)", transition: "all 0.2s",
          }}
        >
          {loading ? "Adding..." : "➕ Add Place"}
        </button>
      </form>
    </div>
  );
}
