// pages/admin/department-media.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const DEPARTMENTS = [
  { key: 'art', label: 'Art' },
  { key: 'business', label: 'Business Options' },
  { key: 'agx', label: 'AGX' },
  { key: 'communication', label: 'Communication' }
];
const SLOTS = [1, 2, 3, 4];

export default function DepartmentMediaAdmin() {
  const [media, setMedia] = useState<any[]>([]);
  const [editing, setEditing] = useState<{[key: string]: boolean}>({});
  const [form, setForm] = useState<any>({}); // key: `${department}_${slot}`

  // Load all media on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('department_media').select('*');
      if (!error) setMedia(data || []);
    })();
  }, []);

  // Helper: find slot by dept/slot
  const getSlot = (department: string, slot: number) =>
    media.find(m => m.department === department && m.slot === slot);

  // Edit handlers
  const handleEdit = (department: string, slot: number) => {
    const key = `${department}_${slot}`;
    setEditing(e => ({ ...e, [key]: true }));
    const entry = getSlot(department, slot);
    setForm(f => ({
      ...f,
      [key]: {
        title: entry?.title || '',
        description: entry?.description || '',
        img_url: entry?.img_url || '',
        link_url: entry?.link_url || ''
      }
    }));
  };

  const handleChange = (key: string, field: string, value: string) => {
    setForm(f => ({
      ...f,
      [key]: {
        ...f[key],
        [field]: value
      }
    }));
  };

  const handleSave = async (department: string, slot: number) => {
    const key = `${department}_${slot}`;
    const values = form[key];
    let id = getSlot(department, slot)?.id;

    if (id) {
      // Update existing
      await supabase.from('department_media')
        .update(values)
        .eq('id', id);
    } else {
      // Insert new
      await supabase.from('department_media')
        .insert([{ department, slot, ...values }]);
    }
    // Refetch
    const { data } = await supabase.from('department_media').select('*');
    setMedia(data || []);
    setEditing(e => ({ ...e, [key]: false }));
  };

  return (
    <div style={{ padding: 40, background: '#181a1f', minHeight: '100vh', color: '#fff' }}>
      <h1>Department Carousel Media Editor</h1>
      {DEPARTMENTS.map(dept => (
        <div key={dept.key} style={{ marginBottom: 42 }}>
          <h2 style={{ color: '#0af' }}>{dept.label}</h2>
          <div style={{ display: 'flex', gap: 28 }}>
            {SLOTS.map(slot => {
              const key = `${dept.key}_${slot}`;
              const entry = getSlot(dept.key, slot);
              return (
                <div key={slot} style={{ background: '#252630', borderRadius: 16, padding: 22, width: 260 }}>
                  {editing[key] ? (
                    <>
                      <input
                        value={form[key]?.title || ''}
                        onChange={e => handleChange(key, 'title', e.target.value)}
                        placeholder="Title"
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <input
                        value={form[key]?.description || ''}
                        onChange={e => handleChange(key, 'description', e.target.value)}
                        placeholder="Description"
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <input
                        value={form[key]?.img_url || ''}
                        onChange={e => handleChange(key, 'img_url', e.target.value)}
                        placeholder="Image URL"
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <input
                        value={form[key]?.link_url || ''}
                        onChange={e => handleChange(key, 'link_url', e.target.value)}
                        placeholder="Link URL"
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <button onClick={() => handleSave(dept.key, slot)} style={{ background: '#0af', color: '#111', fontWeight: 600, borderRadius: 8, padding: '8px 20px' }}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{entry?.title || <span style={{ color: '#888' }}>— Empty —</span>}</div>
                      <div style={{ fontSize: 13, margin: '8px 0', minHeight: 32 }}>{entry?.description}</div>
                      {entry?.img_url && (
                        <img src={entry.img_url} alt="" style={{ width: '100%', borderRadius: 12, marginBottom: 8 }} />
                      )}
                      <div style={{ fontSize: 12, color: '#ccc' }}>{entry?.link_url}</div>
                      <button onClick={() => handleEdit(dept.key, slot)} style={{ background: '#111', color: '#0af', fontWeight: 600, borderRadius: 6, padding: '6px 16px', marginTop: 8 }}>
                        Edit
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
