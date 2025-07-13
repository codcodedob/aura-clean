import type { User } from "@supabase/supabase-js";

export function useIsAdmin(user: User | null) {
  const ADMIN_EMAILS = ["you@example.com", "another@example.com"];
  return user ? ADMIN_EMAILS.includes(user.email ?? "") : false;
}
