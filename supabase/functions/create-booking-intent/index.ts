import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const COMMISSION = 0.15;

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { musician_id, event_type, event_date, duration_hours, location, notes } = await req.json();

    // Validate musician exists and is available
    const { data: musician } = await supabase
      .from('musician_profiles')
      .select('id, hourly_rate, stripe_account_id, stripe_onboarding_complete, is_available')
      .eq('id', musician_id)
      .single();

    if (!musician || !musician.stripe_onboarding_complete || !musician.is_available) {
      return new Response(JSON.stringify({ error: 'Musician not available' }), { status: 400 });
    }

    // Check availability conflicts
    const { data: conflicts } = await supabase
      .from('availability')
      .select('id')
      .eq('musician_id', musician_id)
      .eq('is_blocked', true)
      .lte('starts_at', event_date)
      .gte('ends_at', event_date);

    if (conflicts && conflicts.length > 0) {
      return new Response(JSON.stringify({ error: 'Musician not available on that date' }), { status: 409 });
    }

    const quotedAmount = Math.round(musician.hourly_rate * duration_hours);
    const platformFee = Math.round(quotedAmount * COMMISSION);
    const musicianPayout = quotedAmount - platformFee;

    // Create Stripe PaymentIntent (authorize only, capture later)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: quotedAmount,
      currency: 'usd',
      capture_method: 'manual',
      application_fee_amount: platformFee,
      transfer_data: { destination: musician.stripe_account_id },
      metadata: { musician_id, client_id: user.id },
    });

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        musician_id,
        status: 'pending',
        event_type,
        event_date,
        duration_hours,
        location,
        notes,
        quoted_amount: quotedAmount,
        platform_fee: platformFee,
        musician_payout: musicianPayout,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return new Response(
      JSON.stringify({ booking, client_secret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
