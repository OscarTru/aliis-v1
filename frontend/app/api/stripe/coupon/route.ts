import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })

  let body: { code?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const code = body.code?.trim()
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  try {
    // Stripe promotion code search is case-sensitive — try as-is and uppercased
    let promoCode: Stripe.PromotionCode | undefined
    for (const attempt of [code, code.toUpperCase()]) {
      const promo = await stripe.promotionCodes.list({ code: attempt, active: true, limit: 1 })
      if (promo.data[0]) { promoCode = promo.data[0]; break }
    }

    if (!promoCode) return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 404 })

    // Fetch coupon details — .coupon is missing from types in this API version
    const rawCoupon = (promoCode as { coupon?: string | { id: string } }).coupon
    const couponId: string = typeof rawCoupon === 'string' ? rawCoupon : rawCoupon?.id ?? ''
    const coupon = couponId ? await stripe.coupons.retrieve(couponId) : null

    const discount = coupon?.percent_off
      ? `${coupon.percent_off}% de descuento`
      : coupon?.amount_off
        ? `${(coupon.amount_off / 100).toFixed(0)} ${coupon.currency?.toUpperCase()} de descuento`
        : 'Descuento aplicado'

    return NextResponse.json({
      valid: true,
      promotionCodeId: promoCode.id,
      discount,
    })
  } catch (err) {
    console.error('[stripe/coupon]', err)
    return NextResponse.json({ error: 'Error al validar el cupón' }, { status: 500 })
  }
}
