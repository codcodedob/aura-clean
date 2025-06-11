// lib/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js'

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!key) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in env')
}

export const stripePromise: Promise<Stripe | null> = loadStripe(key)
