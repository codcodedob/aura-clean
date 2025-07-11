const handleBuy = async (coinId: string) => {
  const amount = investmentAmounts[coinId] ?? 0;
  const coin = coins.find((c) => c.id === coinId);
  if (!coin) return;

  const userData = await supabase.auth.getUser();
  const userId = userData.data.user?.id;
  if (!userId) {
    alert("Sign in required");
    return;
  }

  if (amount === 0) {
    await supabase.from("coin_activity").insert({
      user_id: userId,
      coin_id: coinId,
      type: "purchase",
      amount,
      description: `Free/discounted purchase for $${amount}`,
    });
    router.push("/receipt");
    return;
  }

  await supabase.from("coin_activity").insert({
    user_id: userId,
    coin_id: coinId,
    type: "purchase",
    amount,
    description: `Intent to purchase $${amount}`,
  });

  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coinId, amount, userId }),
  });
  const json = await res.json();

  if (!res.ok || !json.sessionId) {
    console.error("Error creating checkout:", json.error);
    alert(json.error || "Failed to create checkout.");
    return;
  }

  const stripeModule = await import("@stripe/stripe-js");
  const stripePromise = stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  const stripe = await stripePromise;

  if (!stripe) {
    alert("Stripe failed to load.");
    return;
  }

  await stripe.redirectToCheckout({
    sessionId: json.sessionId,
  });
};
