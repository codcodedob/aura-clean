// pages/admin/video.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useDropzone } from 'react-dropzone';

export default function AdminVideoSettings() {
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch current videourl from settings on mount
  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'videourl')
      .single()
      .then(({ data }) => {
        if (data?.value) setVideoUrl(data.value);
      });
  }, []);

  // Handle upload and settings update
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const filePath = `videos/${Date.now()}-${file.name}`;
    // 1. Upload to Supabase storage (make sure you have a 'videos' bucket!)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // 2. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    setVideoUrl(publicUrl);

    // 3. Upsert into settings table
    await supabase
      .from('settings')
      .upsert([{ key: 'videourl', value: publicUrl }], { onConflict: 'key' });

    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'], 'video/quicktime': ['.mov'] },
    multiple: false,
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024 // 200 MB
  });

  return (
    <div style={{ background: '#161c23', borderRadius: 12, padding: 32, maxWidth: 480, margin: '40px auto', color: '#fff' }}>
      <h2 style={{ marginBottom: 12 }}>Upload Site Background Video</h2>
      <div {...getRootProps()} style={{
        border: '2px dashed #27ef52',
        borderRadius: 10,
        padding: 24,
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive ? '#27ef5233' : '#202c22'
      }}>
        <input {...getInputProps()} />
        {uploading
          ? <span>Uploading...</span>
          : <span>Drag and drop a video here, or click to select (mp4/webm/mov)</span>
        }
      </div>

      {videoUrl && (
        <div style={{ marginTop: 32 }}>
          <h4 style={{ color: '#27ef52' }}>Current Video</h4>
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: '#ddd' }}>URL:<br />
            <code style={{ background: '#222', padding: 3, borderRadius: 3 }}>{videoUrl}</code>
          </div>
        </div>
      )}
    </div>
  );
}
