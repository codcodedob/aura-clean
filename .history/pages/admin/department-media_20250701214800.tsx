// pages/admin/department-media.tsx
import React, { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useDropzone } from "react-dropzone";

// --- SETUP ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getPublicUrl(path: string) {
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export default function AdminDepartmentMedia() {
  const [department, setDepartment] = useState("art");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");
  const [link, setLink] = useState("");
  const [aiScore, setAiScore] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("department_media").select("*").then(({ data }) => {
      if (data) setCards(data);
    });
  }, []);

  // Drag-and-drop handler for images
  const onDropImg = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const filePath = `images/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("media").upload(filePath, file);
    setUploading(false);
    if (error) alert("Upload failed: " + error.message);
    else setImg(getPublicUrl(filePath));
  }, []);

  // Drag-and-drop handler for videos
  const onDropVid = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const filePath = `videos/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("media").upload(filePath, file);
    setUploading(false);
    if (error) alert("Upload failed: " + error.message);
    else setVideo(getPublicUrl(filePath));
  }, []);

  const { getRootProps: getImgRoot, getInputProps: getImgInput } = useDropzone({ onDrop: onDropImg, accept: { "image/*": [] } });
  const { getRootProps: getVidRoot, getInputProps: getVidInput } = useDropzone({ onDrop: onDropVid, accept: { "video/*": [] } });

  // Submit handler
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("department_media").insert({
      department,
      title,
      description,
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
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        
        {/* Image Drag-and-Drop */}
        <div {...getImgRoot()} style={{
          border: '2px dashed #18ff78', borderRadius: 9, padding: 18, textAlign: 'center', background: '#111a', cursor: 'pointer'
        }}>
          <input {...getImgInput()} />
          {img
            ? <img src={img} alt="" style={{ maxWidth: 160, borderRadius: 6, margin: '6px 0' }} />
            : uploading ? "Uploading image..." : "Drag or click to upload image"
          }
        </div>
        {/* Video Drag-and-Drop */}
        <div {...getVidRoot()} style={{
          border: '2px dashed #18ff78', borderRadius: 9, padding: 18, textAlign: 'center', background: '#111a', cursor: 'pointer'
        }}>
          <input {...getVidInput()} />
          {video
            ? <video src={video} controls style={{ maxWidth: 160, borderRadius: 6, margin: '6px 0' }} />
            : uploading ? "Uploading video..." : "Drag or click to upload video"
          }
        </div>
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
            {card.video && <video src={card.video} controls style={{ width: 110, borderRadius: 6, margin: "6px 0" }} />}
            <div style={{ fontSize: 12, opacity: 0.7 }}>{card.description}</div>
            <div style={{ color: "#18ff78", fontSize: 11 }}>Dept: {card.department} | AI: {card.ai_score} | {card.featured ? "⭐" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
