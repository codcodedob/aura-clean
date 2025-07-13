import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";


import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

// Create a Supabase client with service role key to delete Auth user
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Validate session
  const supabase = createPagesServerClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 1) Delete user row
  const { error: deleteRowError } = await supabase
    .from("users")
    .delete()
    .eq("auth_id", user.id);

  if (deleteRowError) {
    return res.status(500).json({ error: "Failed to delete user data: " + deleteRowError.message });
  }

  // 2) Delete the Supabase Auth account
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteAuthError) {
    return res.status(500).json({ error: "Failed to delete auth account: " + deleteAuthError.message });
  }

  return res.status(200).json({ message: "Account fully deleted" });
}
