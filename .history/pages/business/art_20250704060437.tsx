// pages/business/art.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

// Define fields for ArcSession and Business flows
const arcFields = [
  'halo_id', 'birthday', 'age', 'sex', 'address',
  'parent_a_halo', 'parent_z_halo', 'username',
  'display_image', 'shipping_address', 'halo_range'
];
const businessFields = [
  'account_created', 'art_role', 'portfolio', 'wallet', 'verification'
];

export default function ArtOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [userFlow, setUserFlow] = useState<'arc' | 'business'>('arc');

  // Determine current field list
  const currentFields = userFlow === 'arc' ? arcFields : businessFields;
  // Calculate completion percentage
  const completedCount = currentFields.filter(f => userData[f]).length;
  const percentComplete = Math.floor((completedCount / currentFields.length) * 100);

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);
      
      // Fetch user table data
      let { data: udata } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      // Fetch halo_profiles
      const { data: halo } = await supabase
        .from('halo_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // Fetch business_profiles
      const { data: biz } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // Merge
      const merged = { ...(udata || {}), ...(halo || {}), ...(biz || {}) };
      setUserData(merged);
      // Set preferred flow if exists
      if (merged.preferred_flow === 'business') setUserFlow('business');
      else setUserFlow('arc');
    }
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>
        {userFlow === 'arc' ? 'ArcSession Onboarding' : 'Business Onboarding'}
      </h1>

      {/* Toggle */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setUserFlow('arc')}
          style={{
            marginRight: 12,
            background: userFlow === 'arc' ? '#39ff14' : 'transparent',
            color: userFlow === 'arc' ? '#000' : '#bbb',
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #39ff14',
            cursor: 'pointer'
          }}
        >
          ArcSession
        </button>
        <button
          onClick={() => setUserFlow('business')}
          style={{
            background: userFlow === 'business' ? '#39ff14' : 'transparent',
            color: userFlow === 'business' ? '#000' : '#bbb',
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #39ff14',
            cursor: 'pointer'
          }}
        >
          Business
        </button>
      </div>

      {/* Progress Meter */}
      <div style={{ background: '#222', borderRadius: 8, overflow: 'hidden', margin: '0 auto', width: '80%', marginBottom: 32 }}>
        <div
          style={{
            width: `${percentComplete}%`,
            background: '#39ff14',
            height: 12,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
      <p style={{ textAlign: 'center', marginBottom: 32 }}>{percentComplete}% complete</p>

      {/* Step Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {currentFields.map(field => (
          <motion.button
            key={field}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: userData[field] ? '#1a1a1a' : 'transparent',
              color: userData[field] ? '#39ff14' : '#bbb',
              border: '1px solid #444',
              cursor: 'pointer'
            }}
          >
            {userData[field] ? `✔ ${field}` : field}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
