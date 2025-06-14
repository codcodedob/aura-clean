
// pages/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { supabase } from '@/lib/supabaseClient';
import { stripePromise } from '@/lib/stripe';
import type { User } from '@supabase/supabase-js';

interface Coin {
  id: string;
  user_id: string;
  name: string;
  price: number;
  cap: number;
  emoji?: string;
  visible?: boolean;
  tagline?: string;
  vision?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadCoins();
  }, [user]);

  const loadCoins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coins?limit=100&offset=0');
      const json = await res.json();
      setCoins(json);
    } catch (err) {
      console.error('Failed to load coins:', err);
    } finally {
      setLoading(false);
    }
  };

  const CoinCard = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coin = coins[index];
    return (
      <div style={{ ...style, padding: '1rem', borderBottom: '1px solid #333' }}>
        <strong>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · Cap {coin.cap}</p>
        <p><em>{coin.tagline || ''}</em></p>
        <p>{coin.vision || ''}</p>
        <button>Buy</button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        <List height={window.innerHeight - 100} itemCount={coins.length} itemSize={120} width={'100%'}>
          {CoinCard}
        </List>
      </div>

      <div style={{ flex: 1, padding: '2rem', textAlign: 'center', borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
        <h1>AURA</h1>
        <p><strong>{user?.email ?? 'Not signed in'}</strong></p>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        <List height={window.innerHeight - 100} itemCount={coins.length} itemSize={120} width={'100%'}>
          {CoinCard}
        </List>
      </div>
    </div>
  );
}
