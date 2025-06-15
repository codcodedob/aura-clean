
// components/PaymentForm.tsx
import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm({ coinId, amount }: { coinId: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!coinId || !amount || amount < 1) return
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId, amount: Math.round(amount * 100) }) // Convert to cents
    })
      .then(r => r.json())
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => setError(err.message))
  }, [coinId, amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    const card = elements.getElement(CardElement)
    if (!card) return
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    })
    if (stripeError) {
      setError(stripeError.message || 'Payment failed')
    } else {
      alert(`✅ Payment successful! ID: ${paymentIntent?.id}`)
    }
  }

  return clientSecret ? (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <CardElement options={{ style: { base: { color: '#fff' } } }} />
      <button type="submit" disabled={!stripe} style={{ marginTop: 12, padding: '8px 16px' }}>
        Pay ${(amount).toFixed(2)}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  ) : <p>Preparing payment form…</p>
}

export default function PaymentForm(props: { coinId: string; amount: number }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
