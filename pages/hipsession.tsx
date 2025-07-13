// pages/hipsession.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryDB {
  id: string;
  is_active: boolean;
  issue: string | null;
  name: string;
  video_url: string | null;
  image_url: string | null;
  timestamp: string;
  aspect_ratio: number | null;
  [key: string]: unknown; // Add this line
}


interface Category {
  id: string;
  isActive: boolean;
  issue: string | null;
  name: string;
  videoUrl: string | null;
  imageUrl: string | null;
  timestamp: string;
  aspectRatio: number | null;
}

const PAGE_SIZE = 10;

function toCamelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeysToCamel<T>(obj: Record<string, unknown>): T {
  const newObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        newObj[camelKey] = mapKeysToCamel(value as Record<string, unknown>);
      } else {
        newObj[camelKey] = value;
      }
    }
  }
  return newObj as T;
}

export default function HipSession() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*') // no generic here
        .order('timestamp', { ascending: sortOrder === 'asc' })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      setLoading(false);
    
      if (error) {
        console.error('Error loading categories:', error.message);
        setCategories([]);
        setFilteredCategories([]);
        setPreviewCategory(null);
      } else if (data) {
        const typedData = data as CategoryDB[];
        const mapped = typedData.map(item => mapKeysToCamel<Category>(item));
        setCategories(mapped);
        setFilteredCategories(mapped);
        setPreviewCategory(mapped[0] ?? null);
      }
    }
    
    fetchCategories();
  }, [page, sortOrder]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredCategories(categories);
      setPreviewCategory(categories[0] ?? null);
    } else {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lowerSearch) ||
          (cat.issue && cat.issue.toLowerCase().includes(lowerSearch))
      );
      setFilteredCategories(filtered);
      setPreviewCategory(filtered[0] ?? null);
    }
  }, [debouncedSearchTerm, categories]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    cat: Category
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/products/${cat.id}`;
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 700, margin: 'auto' }}>
      <h1>Categories</h1>

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
          {previewCategory.videoUrl?.length ? (
            <video
              key={previewCategory.id}
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
          ) : previewCategory.imageUrl?.length ? (
            <Image
              src={previewCategory.imageUrl}
              alt={previewCategory.name}
              width={700}
              height={320}
              style={{
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
              priority
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
            <Link key={cat.id} href={`/products/${cat.id}`} passHref legacyBehavior>
              <li
                tabIndex={0}
                onMouseEnter={() => setPreviewCategory(cat)}
                onMouseLeave={() =>
                  setPreviewCategory(filteredCategories[0] ?? null)
                }
                onKeyDown={(e) => handleKeyDown(e, cat)}
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
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f0f0f0')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
                role="link"
                aria-label={`View products in category ${cat.name}`}
              >
                {cat.imageUrl && (
                  <Image
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
            </Link>
          ))}
        </ul>
      )}

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
