// pages/success.tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // You could fetch more details from Stripe using session_id here
      console.log("✅ Payment successful, session ID:", session_id);
      setLoading(false);
    }
  }, [session_id]);

  if (loading) return <p>Loading payment confirmation...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🎉 Payment Successful</h1>
      <p>Thank you for your purchase!</p>
      <p>Session ID: {session_id}</p>
    </div>
  );
}
