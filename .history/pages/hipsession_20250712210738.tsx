// pages/hipsession.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Category {
  id: string;
  isActive: boolean;
  issue: string | null;
  name: string;
  videoUrl: string | null;
  imageUrl: string | null;
  timestamp: string;
  aspect_ratio: number | null;
}

const PAGE_SIZE = 10;

export default function HipSession() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // The category currently shown in the preview
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);

  // Fetch total count
  useEffect(() => {
    async function fetchCount() {
      const { count, error } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching count:', error.message);
      } else {
        setTotalCount(count ?? 0);
      }
    }
    fetchCount();
  }, []);

  // Fetch categories for current page and sort order
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);

      const { data, error } = await supabase
        .from<Category>('categories')
        .select('*')
        .order('timestamp', { ascending: sortOrder === 'asc' })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      setLoading(false);

      if (error) {
        console.error('Error loading categories:', error.message);
        setCategories([]);
        setFilteredCategories([]);
        setPreviewCategory(null);
      } else if (data) {
        setCategories(data);
        setFilteredCategories(data);
        setPreviewCategory(data[0] ?? null);
      }
    }
    fetchCategories();
  }, [page, sortOrder]);

  // Filter categories on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      setPreviewCategory(categories[0] ?? null);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lowerSearch) ||
          (cat.issue && cat.issue.toLowerCase().includes(lowerSearch))
      );
      setFilteredCategories(filtered);
      setPreviewCategory(filtered[0] ?? null);
    }
  }, [searchTerm, categories]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div style={{ padding: '1rem', maxWidth: 700, margin: 'auto' }}>
      <h1>Categories</h1>

      {/* Preview video or image */}
      {previewCategory ? (
        <div
          style={{
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: 8,
            overflow: 'hidden',
            height: 320,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#000',
          }}
        >
          {previewCategory.videoUrl ? (
            <video
              key={previewCategory.id} // forces remount on hover
              src={previewCategory.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
            />
          ) : previewCategory.imageUrl ? (
            <Image
              src={previewCategory.imageUrl}
              alt={previewCategory.name}
              width={700}
              height={320}
              style={{
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
              priority={true} // for better LCP
            />
          ) : (
            <div style={{ color: '#fff', padding: '2rem' }}>
              No preview available
            </div>
          )}
        </div>
      ) : (
        <p>No categories to preview</p>
      )}

      <input
        type="text"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          fontSize: '1rem',
        }}
      />

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Sort by Date:{' '}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.targ
