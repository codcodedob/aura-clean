// pages/api/create-plaid-link-token.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, PlaidApi, PlaidEnvironments, Products } from 'plaid'

const PLAID_ENV = process.env.PLAID_ENVIRONMENT || 'sandbox'  // e.g. 'sandbox', 'development', 'production'

const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

const client = new PlaidApi(config)

type Data = {
  link_token?: string
  expiration?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { userId } = req.body as { userId?: string }
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' })
  }

  try {
    const createResponse = await client.linkTokenCreate({
      user: {
        // A unique identifier for the end user, e.g. your internal user id
        client_user_id: userId,
      },
      client_name: 'Your App Name',
      products: [Products.Auth],            // or other products you need
      country_codes: ['US'],               // adjust as needed
      language: 'en',
      // Optional: webhook, redirect_uri, account_filters, etc.
    })

    const { link_token, expiration } = createResponse.data
    return res.status(200).json({ link_token, expiration })
  } catch (error: any) {
    console.error('Plaid linkTokenCreate error:', error)
    const errMsg = error.response?.data ?? error.message
    return res.status(500).json({ error: String(errMsg) })
  }
}
