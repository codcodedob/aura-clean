import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Load and validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log them for debug (do NOT log keys in production)
console.log("✅ SUPABASE_URL:", supabaseUrl);
console.log("✅ SUPABASE_SERVICE_ROLE_KEY loaded:", !!supabaseKey); // true/false instead of showing the key

// Fail-fast if missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Missing required Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

// Safe client creation
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
