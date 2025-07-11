type UserProfile = {
  stripe_customer_id: string | null;
  email: string | null;
};

const { data, error } = await supabaseAdmin
  .from("users")
  .select("stripe_customer_id, email")
  .eq("id", userId)
  .single();

if (error || !data) {
  return res.status(500).json({ error: error?.message || "User lookup failed" });
}

const userProfile = data as UserProfile;
const customer = userProfile.stripe_customer_id;
const email = userProfile.email;
