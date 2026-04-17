import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const APP_URL = Deno.env.get('APP_URL') ?? 'melody://';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { data: musician } = await supabase
      .from('musician_profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    let accountId = musician?.stripe_account_id;

    // Create Express account if not yet created
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      await supabase
        .from('musician_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}musician/profile/edit`,
      return_url: `${APP_URL}musician/stripe-return`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
