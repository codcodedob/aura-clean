
// pages/index.tsx
import React, { useState, useEffect } from 'react';
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
  tagline?: string;
  vision?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [investAmounts, setInvestAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetch('/api/coins?limit=100&offset=0')
      .then(res => res.json())
      .then(data => setCoins(data))
      .catch(err => console.error('Failed to load coins:', err));
  }, []);

  const handleBuy = async (coin: Coin) => {
    const amount = investAmounts[coin.id] ?? coin.price;
    const stripe = await stripePromise;
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId: coin.id, amount: Math.round(amount * 100) }),
    });
    const { sessionId } = await res.json();
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>My Coins</h1>
      {coins.map(coin => (
        <div key={coin.id} style={{ border: '1px solid #555', margin: 16, padding: 16 }}>
          <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
          <p>${coin.price.toFixed(2)} | Cap: {coin.cap}</p>
          <p><em>{coin.tagline}</em></p>
          <p>{coin.vision}</p>
          <input
            type="number"
            value={investAmounts[coin.id] ?? ''}
            placeholder="Amount to invest"
            min={coin.price}
            onChange={e => setInvestAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
            style={{ marginRight: 8 }}
          />
          <button onClick={() => handleBuy(coin)}>Buy</button>
        </div>
      ))}
    </div>
  );
}
