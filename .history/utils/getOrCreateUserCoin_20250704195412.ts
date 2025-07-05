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
}

export async function getOrCreateUserCoin(userId: string, input: CoinInput): Promise<Coin> {
  // 1. Find user's coin(s), prefer an active one if you have that logic
  const { data: coins, error } = await supabase
    .from('aura_coins')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  if (coins && coins.length > 0) {
    // Prefer active coin if present, else return first
    const activeCoin = coins.find((c: any) => c.active);
    return (activeCoin || coins[0]) as Coin;
  }

  // 2. If none exist, create a new coin
  const { data: created, error: insertError } = await supabase
    .from('aura_coins')
    .insert([{
      user_id: userId,
      coinName: input.coinName || "My Coin",
      symbol: input.symbol || "COIN",
      scopes: input.scopes || [],
      dividends_eligible: !!input.dividends_eligible,
      active: input.active ?? false,
    }])
    .select()
    .single();

  if (insertError) throw insertError;
  return created as Coin;
}

export default getOrCreateUserCoin;
