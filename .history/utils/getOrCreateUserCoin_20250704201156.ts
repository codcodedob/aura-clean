// utils/getOrCreateUserCoin.ts
import { supabase } from "@/lib/supabaseClient";

/**
 * Gets the ID of the user's existing coin, or creates a new one (inactive) if none found.
 * @param user - The Supabase user object (must have at least 'id' and 'email')
 * @returns coinId (string)
 */
export const getOrCreateUserCoin = async (user: { id: string; email: string }) => {
  if (!user || !user.id) throw new Error("User not found or not signed in.");

  // Try to find an existing coin for this user
  const { data: coin, error: findError } = await supabase
    .from("aura_coins")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (coin && coin.id) return coin.id;

  // Otherwise, create a new default coin for the user (inactive)
  const { data: newCoin, error: createError } = await supabase
    .from("aura_coins")
    .insert([{
      coinName: (user.email || "user") + " Coin",
      symbol: user.email?.split("@")[0]?.slice(0, 8)?.toUpperCase() || "NEWCOIN",
      scopes: ["site"],
      dividends_eligible: false,
      user_id: user.id,
      active: false,
    }])
    .select("id")
    .single();

  if (createError) throw createError;
  if (!newCoin?.id) throw new Error("Failed to create coin.");
  return newCoin.id;
};
