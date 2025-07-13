import { supabase } from "@/lib/supabaseClient";

export async function checkIsAdmin(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("name", "Dobe")
    .or(`primary_exec.eq.${userId},executives.cs."{${userId}}"`)
    .maybeSingle();

  if (error) {
    console.error("Admin check error:", error);
    return false;
  }
  return !!data;
}
