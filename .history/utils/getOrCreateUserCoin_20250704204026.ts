// utils/getOrCreateUserCoin.ts

import { supabase } from "@/lib/supabaseClient";

export const getOrCreateUserCoin = async (user: any) => {
  if (!user || !user.id || !user.email) throw new Error("Missing user object!");

  // Try to find an existing coin for this user
  const { data: coin, error: findError } = await supabase
    .from("aura_coins")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (coin && coin.id) return coin.id;

  // Create a new default coin for the user (inactive)
  const { data: newCoin, error: coinError } = await supabase
    .from("aura_coins")
    .insert([{
      name: `${user.email} Coin`,
      symbol: user.email?.split("@")[0]?.slice(0, 8)?.toUpperCase() || "NEWCOIN",
      scope: ["site"],
      dividend_eligible: false,
      user_id: user.id,
      active: false,
      owner_name: user.email
    }])
    .select("id")
    .single();

  if (coinError) throw coinError;
  if (!newCoin || !newCoin.id) throw new Error("Failed to create coin.");

  return newCoin.id;
};
