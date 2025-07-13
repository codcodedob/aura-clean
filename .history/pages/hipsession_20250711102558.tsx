import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

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

  // Fetch total count of categories
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
      } else if (data) {
        setCategories(data);
        setFilteredCategories(data);
      }
    }
    fetchCategories();
  }, [page, sortOrder]);

  // Filter categories on search term change (client-side)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(lowerSearch) ||
            (cat.issue && cat.issue.toLowerCase().includes(lowerSearch))
        )
      );
    }
  }, [searchTerm, categories]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // The category to preview (first in filtered list)
  const previewCategory = filteredCategories[0];

  return (
    <div style={{ padding: '1rem', maxWidth: 700, margin: 'auto' }}>
      <h1>Categories</h1>

      {/* Preview video or image */}
      {previewCategory && (
        <div
          style={{
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: 8,
            overflow: 'hidden',
            maxHeight: 320,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#000',
          }}
        >
          {previewCategory.videoUrl ? (
            <video
              key={previewCategory.videoUrl} // reload video if URL changes
              src={previewCategory.videoUrl}
              controls
              autoPlay
              muted
              loop
              style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
            />
          ) : previewCategory.imageUrl ? (
            <img
              src={previewCategory.imageUrl}
              alt={previewCategory.name}
              style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ color: '#fff', padding: '2rem' }}>No preview available</div>
          )}
        </div>
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
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading categories...</p>
      ) : filteredCategories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredCategories.map((cat) => (
            <li
              key={cat.id}
              onClick={() => router.push(`/products/${cat.id}`)}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#f0f0f0')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <div>
                <strong>{cat.name}</strong>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>
                  Issue: {cat.issue || 'N/A'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  {new Date(cat.timestamp).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination controls */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
