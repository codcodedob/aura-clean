// utils/getOrCreateUserCoin.ts

import { supabase } from "@/lib/supabaseClient";

// Accepts a Supabase user object
export async function getOrCreateUserCoin(user: any): Promise<string> {
  if (!user) throw new Error("User is required");

  // 1. Try to find an existing coin for this user
  const { data: coin, error } = await supabase
    .from("aura_coins")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (coin && coin.id) return coin.id;

  // 2. Otherwise, create a new default coin for the user (inactive)
  const { data: newCoin, error: coinError } = await supabase
    .from("aura_coins")
    .insert({
      name: user.email + " Coin",
      symbol: (user.email?.split("@")[0]?.slice(0, 8)?.toUpperCase() || "COIN"),
      scope: ["site"],
      dividend_eligible: false,
      user_id: user.id,
      active: false,
      owner_name: user.email,
    })
    .select("id")
    .single();

  if (coinError) throw coinError;
  if (!newCoin || !newCoin.id) throw new Error("Failed to create user coin");
  return newCoin.id;
}
