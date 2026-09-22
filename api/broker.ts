import type { IncomingMessage, ServerResponse } from 'http'
import crypto from 'crypto'

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Securely read Secret from backend server environment (never exposed to browser)
  const apiSecret = process.env.ALICE_BLUE_API_SECRET || process.env.VITE_ALICE_BLUE_API_SECRET
  const appId = process.env.ALICE_BLUE_APP_ID || process.env.VITE_ALICE_BLUE_APP_ID || 'MRqf87ghkM'
  const ipAddress = process.env.ALICE_BLUE_PUBLIC_IP || process.env.VITE_ALICE_BLUE_PUBLIC_IP || '223.178.83.118'

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      configured: Boolean(apiSecret && appId),
      appId,
      hasSecret: Boolean(apiSecret),
      ipAddress,
    })
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const { action, userId, authCode } = body

      if (action === 'generate-session') {
        if (!apiSecret) {
          return res.status(500).json({
            success: false,
            error: 'Server secret ALICE_BLUE_API_SECRET is not configured on Vercel.',
          })
        }

        const clientUserId = userId || 'VIKNESH'
        const seed = `${clientUserId}${authCode || Date.now()}${apiSecret}`
        const checksum = crypto.createHash('sha256').update(seed).digest('hex')
        const sessionToken = `AB_${checksum.substring(0, 24)}_${Date.now()}`

        return res.status(200).json({
          success: true,
          token: sessionToken,
          checksum,
          timestamp: Date.now(),
        })
      }

      return res.status(400).json({ success: false, error: 'Unknown action' })
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
