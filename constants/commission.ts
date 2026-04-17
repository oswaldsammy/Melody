export const PLATFORM_COMMISSION_RATE = 0.15;

export function calculateFees(quotedAmountCents: number) {
  const platformFee = Math.round(quotedAmountCents * PLATFORM_COMMISSION_RATE);
  const musicianPayout = quotedAmountCents - platformFee;
  return { platformFee, musicianPayout };
}
