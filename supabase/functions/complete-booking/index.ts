import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { booking_id } = await req.json();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (!booking) return new Response('Not found', { status: 404 });
    if (booking.client_id !== user.id && booking.musician_id !== user.id) {
      return new Response('Forbidden', { status: 403 });
    }
    if (booking.status !== 'confirmed') {
      return new Response(JSON.stringify({ error: 'Booking must be confirmed first' }), { status: 400 });
    }

    // Capture payment
    await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);

    // Update booking
    await supabase
      .from('bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString(), paid_at: new Date().toISOString() })
      .eq('id', booking_id);

    // Notify client to leave a review
    await supabase.from('notifications').insert({
      user_id: booking.client_id,
      type: 'booking_completed',
      payload: { booking_id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
