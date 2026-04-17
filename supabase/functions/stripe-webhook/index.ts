import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    if (account.details_submitted) {
      await supabase
        .from('musician_profiles')
        .update({ stripe_onboarding_complete: true })
        .eq('stripe_account_id', account.id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
