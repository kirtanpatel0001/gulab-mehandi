import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const signText = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signText.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // MARK ORDER AS PAID
    const { data: orderData, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('user_id')
      .single();

    if (updateError) throw updateError;

    // EMPTY THE CART
    if (orderData?.user_id) {
      await supabaseAdmin.from('cart_items').delete().eq('user_id', orderData.user_id);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server error during verification." }, { status: 500 });
  }
}