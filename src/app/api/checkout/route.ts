import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay environment variables are missing.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // ✅ Both SDKs initialized INSIDE handler — safe for Vercel serverless
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { userId, addressId, customerName, currency = 'INR' } = body;

    if (!userId || !addressId || !customerName) {
      return NextResponse.json({ error: "Missing required information." }, { status: 400 });
    }

    // ✅ Server-side cart fetch — user cannot tamper with price
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('quantity, product:products(price)')
      .eq('user_id', userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
    }

    // ✅ Server-side price calculation — never trust the frontend
    const totalAmount = cartItems.reduce((total: number, item: any) => {
      const price = Array.isArray(item.product) ? item.product[0].price : item.product.price;
      return total + (price * item.quantity);
    }, 0);

    const amountInSubunits = Math.round(totalAmount * 100); // Razorpay uses paise

    // ✅ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: currency,
      receipt: `rcpt_${userId.substring(0, 8)}_${Date.now()}`,
    });

    // ✅ Schema verified: customer_name, total, total_amount, shipping_address_id, razorpay_order_id, currency, status
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: userId,
        shipping_address_id: addressId,
        customer_name: customerName,
        total: totalAmount,
        total_amount: totalAmount,
        currency: currency,
        razorpay_order_id: razorpayOrder.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      id: razorpayOrder.id,
      db_order_id: orderData.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Failed to initialize checkout." }, { status: 500 });
  }
}