import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, addressId, customerName, currency = 'INR' } = body;

    if (!userId || !addressId || !customerName) {
      return NextResponse.json({ error: "Missing required information." }, { status: 400 });
    }

    // 1. SECURE FETCH: Grab cart directly from DB
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('quantity, product:products(price)')
      .eq('user_id', userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
    }

    // 2. SERVER-SIDE MATH
    const totalAmount = cartItems.reduce((total, item) => {
      const price = Array.isArray(item.product) ? item.product[0].price : item.product.price;
      return total + (price * item.quantity);
    }, 0);

    const amountInSubunits = Math.round(totalAmount * 100);

    // 3. CREATE RAZORPAY ORDER
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: currency, 
      receipt: `rcpt_${userId.substring(0, 8)}_${Date.now()}`,
    });

    // 4. SAVE PENDING ORDER TO SUPABASE (Strict Schema Match)
    const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert([{
      user_id: userId,
      shipping_address_id: addressId,
      customer_name: customerName, 
      total: totalAmount,          
      total_amount: totalAmount,
      currency: currency,
      razorpay_order_id: razorpayOrder.id,
      status: 'pending' // It starts as pending until they pay!
    }]).select().single();

    if (orderError) throw orderError;

    // 5. SEND DATA BACK TO FRONTEND
    return NextResponse.json({
      id: razorpayOrder.id,
      db_order_id: orderData.id, // We need this to redirect to the invoice later!
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Failed to initialize checkout." }, { status: 500 });
  }
}