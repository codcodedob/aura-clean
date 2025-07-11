import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

console.log("✅ SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("✅ SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
