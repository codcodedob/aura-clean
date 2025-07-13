import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  video_url: string | null;
  product_description: string | null;
}

export default function ProductsByCategory() {
  const router = useRouter();
  const { categoryid } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryid) return;

    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryid);

      setLoading(false);

      if (error) {
        console.error('Error fetching products:', error.message);
      } else {
        setProducts(data ?? []);
      }
    }

    fetchProducts();
  }, [categoryid]);

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: 'auto' }}>
      <h1>Products in Category: {categoryid}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map((prod) => (
            <li
              key={prod.id}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '1rem 0',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {prod.image_url && (
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <Image
                    src={prod.image_url}
                    alt={prod.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100px"
                  />
                </div>
              )}
              <div>
                <strong>{prod.name}</strong>
                <div>${prod.price.toFixed(2)}</div>
                {prod.product_description && (
                  <div style={{ marginTop: '0.5rem' }}>{prod.product_description}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
