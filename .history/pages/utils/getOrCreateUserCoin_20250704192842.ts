// utils/getOrCreateUserCoin.ts
import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateUserCoin(user: any, opts: {
  coinName?: string,
  symbol?: string,
  scopes?: string[],
  dividends_eligible?: boolean,
  active?: boolean
} = {}) {
  if (!user?.id) throw new Error("User required");
  // 1. Try to find existing coin
  const { data: coins, error } = await supabase
    .from("aura_coins")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;
  if (coins && coins.length > 0) return coins[0]; // Found, return the first

  // 2. Create coin if not found
  const coinName = opts.coinName || `${user.email?.split("@")[0] || "User"}'s Coin`;
  const { data: newCoin, error: insertError } = await supabase
    .from("aura_coins")
    .insert([{
      name: coinName,
      symbol: opts.symbol || "",
      scope: opts.scopes || [],
      dividends_eligible: !!opts.dividends_eligible,
      user_id: user.id,
      active: opts.active ?? false,
    }])
    .select()
    .single();
  if (insertError) throw insertError;
  return newCoin;
}
