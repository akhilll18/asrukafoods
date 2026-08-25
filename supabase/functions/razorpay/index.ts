// supabase/functions/razorpay/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const razorpayKeyId = Deno.env.get('VITE_RAZORPAY_KEY_ID') || '';
const razorpayKeySecret = Deno.env.get('VITE_RAZORPAY_KEY_SECRET') || '';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const { amount, currency, receipt } = await req.json();
    console.log('💰 Creating order for amount:', amount);

    // Call Razorpay API
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay error: ${error}`);
    }

    const order = await response.json();
    console.log('✅ Order created:', order.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});