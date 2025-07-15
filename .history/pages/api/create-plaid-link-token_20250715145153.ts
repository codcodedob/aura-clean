// pages/api/create-plaid-link-token.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'
import type { AxiosError } from 'axios/index';




const PLAID_ENV = process.env.PLAID_ENVIRONMENT || 'sandbox'  // 'sandbox', 'development', 'production'

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
        client_user_id: userId,
      },
      client_name: 'Your App Name',
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    const { link_token, expiration } = createResponse.data
    return res.status(200).json({ link_token, expiration })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError
      console.error('Plaid linkTokenCreate error:', axiosError)
      const errMsg = axiosError.response?.data ?? axiosError.message
      return res.status(500).json({ error: String(errMsg) })
    }
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}
