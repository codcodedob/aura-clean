import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDepartmentMedia() {
  const [department, setDepartment] = useState("art");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");
  const [link, setLink] = useState("");
  const [aiScore, setAiScore] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("department_media").select("*").then(({ data }) => {
      if (data) setCards(data);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("department_media").insert({
      department,
      title,
      desc,
      img,
      video,
      link,
      ai_score: aiScore,
      featured,
    });
    if (!error) window.location.reload();
    else alert(error.message);
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 40, background: "#181c28", color: "#fff", borderRadius: 16 }}>
      <h2>Admin: Department Media (Carousel)</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
        <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department (art, comms, etc.)" required />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
        <input value={img} onChange={e => setImg(e.target.value)} placeholder="Image URL" />
        <input value={video} onChange={e => setVideo(e.target.value)} placeholder="Video URL" />
        <input value={link} onChange={e => setLink(e.target.value)} placeholder="Detail Link" />
        <input type="number" value={aiScore} onChange={e => setAiScore(Number(e.target.value))} placeholder="AI Score (0-100)" />
        <label>
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Featured
        </label>
        <button type="submit" style={{ background: "#18ff78", color: "#111", fontWeight: 700, borderRadius: 8, padding: 12 }}>Add Media</button>
      </form>
      <div>
        <h3>Current Entries</h3>
        {cards.map(card => (
          <div key={card.id} style={{ marginBottom: 20, background: "#222", borderRadius: 10, padding: 16 }}>
            <b>{card.title}</b> <br />
            {card.img && <img src={card.img} alt="" style={{ width: 110, borderRadius: 6, margin: "6px 0" }} />}
            <div style={{ fontSize: 12, opacity: 0.7 }}>{card.desc}</div>
            <div style={{ color: "#18ff78", fontSize: 11 }}>Dept: {card.department} | AI: {card.ai_score} | {card.featured ? "⭐" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
