import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next"; // Import the types from next

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the handler function with the correct types for req and res
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {
    // Fetch data from the 'models' table in Supabase
    const { data, error } = await supabase.from("models").select();

    if (error) {
      throw error;
    }

    // Return the models data as a JSON response
    res.status(200).json({ models: data });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
}
