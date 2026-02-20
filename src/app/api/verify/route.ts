import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // ✅ FIX: Moved INSIDE handler — was at module level before (Vercel build crash bug)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("CRITICAL: Supabase environment variables are missing.");
      return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // ✅ Validate all required fields present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing payment details." }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
    }

    // ✅ Cryptographic signature verification — this is the real security gate
    const signText = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signText)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment signature mismatch — possible fraud attempt.");
      return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // ✅ Mark order as paid — only runs after signature is verified
    const { data: orderData, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('user_id')
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      throw updateError;
    }

    // ✅ Clear cart after confirmed payment
    if (orderData?.user_id) {
      const { error: cartError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', orderData.user_id);

      if (cartError) {
        // Non-fatal — payment succeeded, cart clear failed
        // Don't throw — user still gets success, can be manually cleared
        console.error("Cart clear failed (non-fatal):", cartError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Verify API Error:", error);
    return NextResponse.json({ success: false, error: "Server error during verification." }, { status: 500 });
  }
}