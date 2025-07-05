import { supabase } from '@/lib/supabaseClient';

export interface CoinInput {
  coinName?: string;
  symbol?: string;
  scopes?: string[];
  dividends_eligible?: boolean;
  active?: boolean;
}

export interface Coin {
  id: string;
  user_id: string;
  coinName: string;
  symbol: string;
  scopes: string[];
  dividends_eligible: boolean;
  active: boolean;
  // ...add other fields as needed
}

export async function getOrCreateUserCoin(
  userId: string,
  input: CoinInput
): Promise<Coin> {
  // 1. Try to find an existing coin for this user (not necessarily active)
  const { data: existing, error } = await supabase
    .from('aura_coins')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing as Coin;

  // 2. Insert a new coin for this user
  const { data: created, error: insertError } = await supabase
    .from('aura_coins')
    .insert([{
      user_id: userId,
      coinName: input.coinName || "My Coin",
      symbol: input.symbol || "COIN",
      scopes: input.scopes || [],
      dividends_eligible: !!input.dividends_eligible,
      active: input.active ?? false, // Default to not active
    }])
    .select()
    .single();

  if (insertError) throw insertError;
  return created as Coin;
}

export default getOrCreateUserCoin;
