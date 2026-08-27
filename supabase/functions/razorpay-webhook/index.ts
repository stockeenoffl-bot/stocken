import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Webhook handler for Razorpay to update subscription/payment statuses.

serve(async (req) => {
  try {
    const signature = req.headers.get('X-Razorpay-Signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    const payloadText = await req.text()
    
    // Validate signature
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || ''
    
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signatureBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadText)
    )
    const expectedSignature = Array.from(new Uint8Array(signatureBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (expectedSignature !== signature) {
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(payloadText)

    // Setup Supabase admin client to bypass RLS for webhook operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log the event
    await supabaseAdmin.from('payment_events').insert({
      provider: 'razorpay',
      event_type: event.event,
      provider_event_id: event.account_id + '_' + event.created_at, // Razorpay doesn't always send a unique event ID at root
      payload: event
    })

    // Handle specific events
    switch (event.event) {
      case 'order.paid': {
        const order = event.payload.order.entity
        const payment = event.payload.payment.entity
        const { user_id, plan_id } = order.notes

        if (!user_id || !plan_id) throw new Error('Missing metadata notes')

        // 1. Insert Payment
        await supabaseAdmin.from('payments').insert({
          user_id,
          provider_order_id: order.id,
          provider_payment_id: payment.id,
          amount: payment.amount / 100, // convert back to rupees
          currency: payment.currency,
          status: 'captured',
          paid_at: new Date(payment.created_at * 1000).toISOString(),
        })

        // 2. Activate/Update Subscription
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // 1 month validity for example

        await supabaseAdmin.from('subscriptions').insert({
          user_id,
          plan_id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: endDate.toISOString(),
        })

        // 3. Update User Role Profile if they bought VIP/Pro
        const { data: plan } = await supabaseAdmin.from('subscription_plans').select('slug').eq('id', plan_id).single()
        
        // Note: Real logic would check if it's pro/vip and update entitlement, usually role is not updated, just subscription status.
        // For simple architecture, we rely on the subscriptions table.
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
