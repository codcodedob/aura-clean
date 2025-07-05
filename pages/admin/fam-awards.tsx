// pages/admin/fam-awards.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";

function FileUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const ext = file.name.split('.').pop();
    const path = `fam-awards/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('media').upload(path, file);
    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase
      .storage
      .from('media')
      .getPublicUrl(path);
    if (urlData?.publicUrl) {
      onUpload(urlData.publicUrl);
    }
    setUploading(false);
  }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #0af",
        padding: 20,
        borderRadius: 14,
        background: "#10182822",
        textAlign: "center",
        marginBottom: 14,
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      {uploading
        ? "Uploading..."
        : isDragActive
          ? "Drop the file here..."
          : "Drag & drop image, or click to select"}
    </div>
  );
}

export default function FamAwardsAdmin() {
  const [awards, setAwards] = useState<any[]>([]);
  const [awardName, setAwardName] = useState("");
  const [winner, setWinner] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [showPicks, setShowPicks] = useState(false);
  const [adminPickIds, setAdminPickIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all awards
  useEffect(() => {
    fetchAwards();
  }, []);

  async function fetchAwards() {
    let { data, error } = await supabase.from('fam_awards').select('*').order('created_at', { ascending: false });
    if (error) return alert("Failed to fetch: " + error.message);
    setAwards(data || []);
    setAdminPickIds((data || []).filter((a: any) => a.admin_pick).map((a: any) => a.id));
  }

  async function submitAward(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('fam_awards').insert([{
      award_name: awardName,
      winner,
      image_url: imageUrl,
      video_url: videoUrl,
      description,
      year,
      admin_pick: false,
    }]);
    setSubmitting(false);
    if (error) {
      alert("Failed to submit: " + error.message);
      return;
    }
    setAwardName(""); setWinner(""); setImageUrl(""); setVideoUrl(""); setDescription("");
    fetchAwards();
  }

  // Toggle pick/unpick for admin
  async function toggleAdminPick(id: string, newPick: boolean) {
    const { error } = await supabase.from('fam_awards').update({ admin_pick: newPick }).eq('id', id);
    if (!error) {
      fetchAwards();
    }
  }

  const displayAwards = showPicks
    ? awards.filter((a: any) => a.admin_pick)
    : awards;

  return (
    <div style={{ padding: 30, background: "#181c24", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ fontSize: 34, marginBottom: 12 }}>FAM Awards Admin</h1>
      <form onSubmit={submitAward} style={{ marginBottom: 34, background: "#1117", padding: 20, borderRadius: 16, maxWidth: 500 }}>
        <h2 style={{ marginBottom: 12 }}>Upload Award Entry</h2>
        <FileUploader onUpload={setImageUrl} />
        {imageUrl && (
          <img src={imageUrl} alt="award" style={{ width: 160, margin: "10px auto", borderRadius: 8, display: "block" }} />
        )}
        <input
          type="text"
          placeholder="Award Name"
          value={awardName}
          onChange={e => setAwardName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6 }}
        />
        <input
          type="text"
          placeholder="Winner"
          value={winner}
          onChange={e => setWinner(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6 }}
        />
        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="Award Year"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6 }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6 }}
        />
        <button
          type="submit"
          style={{ padding: "10px 24px", background: "#0af", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 18, marginTop: 8 }}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Award"}
        </button>
      </form>

      <div style={{ marginBottom: 28 }}>
        <button onClick={() => setShowPicks(v => !v)} style={{
          padding: "7px 18px", borderRadius: 7, background: "#fecf2f", color: "#222", fontWeight: 600,
          marginRight: 18, border: "none"
        }}>
          {showPicks ? "Show All Entries" : "Show Admin Picks"}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {displayAwards.map((a: any) => (
          <div key={a.id} style={{
            minWidth: 250, background: "#21223a", borderRadius: 13, padding: 15, boxShadow: "0 2px 16px #0af2",
            maxWidth: 320, position: "relative"
          }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{a.award_name}</div>
            <div style={{ fontSize: 13, color: "#fefc", margin: "6px 0" }}>
              Winner: <b>{a.winner}</b>
            </div>
            {a.year && <div style={{ color: "#fecf2f", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Year: {a.year}</div>}
            {a.description && <div style={{ fontSize: 13, color: "#fff8", marginBottom: 7 }}>{a.description}</div>}
            {a.image_url && (
              <img src={a.image_url} alt={a.award_name} style={{ width: "100%", borderRadius: 10, margin: "10px 0" }} />
            )}
            {a.video_url && (
              <video src={a.video_url} style={{ width: "100%", borderRadius: 10, margin: "6px 0" }} controls />
            )}
            <button
              style={{
                position: "absolute", top: 15, right: 15, padding: "3px 10px",
                background: adminPickIds.includes(a.id) ? "#0af" : "#fff3",
                color: adminPickIds.includes(a.id) ? "#fff" : "#222",
                border: "none", borderRadius: 6, fontWeight: 600, fontSize: 14
              }}
              onClick={() => toggleAdminPick(a.id, !adminPickIds.includes(a.id))}
            >
              {adminPickIds.includes(a.id) ? "★ Picked" : "☆ Pick"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
