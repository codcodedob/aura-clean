// lib/types.ts or lib/supabaseTypes.ts

export type UserProfile = {
    id: string;
    email: string;
    stripe_customer_id?: string | null;
  };
  