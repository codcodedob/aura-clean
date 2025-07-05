const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  customer: stripeCustomerId,
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: `AuraCoin: ${coin.name}` },
        unit_amount: unitAmount,
      },
      quantity: 1,
    },
  ],
  payment_intent_data: {
    setup_future_usage: 'off_session', // Correct: This is inside payment_intent_data!
  },
  metadata: {
    coinId: coin.id,
    resaleMode: resaleMode || 'ai',
    amount: amount.toString(),
    userId,
  },
  success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${req.headers.origin}/`,
});
