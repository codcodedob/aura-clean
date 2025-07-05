// utils/getOrCreateUserCoin.ts
import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateUserCoin(userId: string, opts?: { name?: string; symbol?: string; scope?: string[]; dividends_eligible?: boolean }) {
  // 1. Try to find the coin
  const { data: coins, error } = await supabase
    .from("aura_coins")
    .select("*")
    .eq("user_id", userId)
    .limit(1);

  if (error) throw error;

  if (coins && coins.length > 0) {
    return coins[0]; // Found existing coin
  }

  // 2. Otherwise, create one
  const { data: coin, error: createError } = await supabase
    .from("aura_coins")
    .insert([{
      user_id: userId,
      name: opts?.name || "My Coin",
      symbol: opts?.symbol || "MYCOIN",
      scope: opts?.scope || [],
      dividends_eligible: opts?.dividends_eligible ?? false,
      active: false
    }])
    .select()
    .single();

  if (createError) throw createError;
  return coin;
}
