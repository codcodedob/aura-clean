// ...imports
// assume you have stripe and supabase setup as before

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const body = req.body as { coinId: string; amount: number; resaleMode?: string; userId?: string }
    const { coinId, amount, resaleMode, userId } = body

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing coinId, amount, or userId' })
    }

    // 1. Get or create Stripe customer for user
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let stripeCustomerId = userProfile?.stripe_customer_id;
    const email = userProfile?.email;

    if (!stripeCustomerId) {
      // Create a Stripe customer and store in DB
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;
      await supabase.from('users').update({ stripe_customer_id: customer.id }).eq('id', userId);
    }

    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single()

    if (error || !coin) {
      return res.status(404).json({ error: 'Coin not found' })
    }

    const unitAmount = Math.round(amount * 100)

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
      metadata: {
        coinId: coin.id,
        resaleMode: resaleMode || 'ai',
        amount: amount.toString(),
        userId,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Checkout error:', message)
    res.status(500).json({ error: message })
  }
}
