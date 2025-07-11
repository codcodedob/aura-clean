import { createClient } from "@supabase/supabase-js";

// Access the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example API function to fetch models
export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from("models").select();
    if (error) {
      throw error;
    }

    res.status(200).json({ models: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
