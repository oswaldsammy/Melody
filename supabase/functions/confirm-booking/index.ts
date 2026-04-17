import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    if (booking.musician_id !== user.id) return new Response('Forbidden', { status: 403 });
    if (booking.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Booking is not pending' }), { status: 400 });
    }

    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking_id);

    await supabase.from('notifications').insert({
      user_id: booking.client_id,
      type: 'booking_confirmed',
      payload: { booking_id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
