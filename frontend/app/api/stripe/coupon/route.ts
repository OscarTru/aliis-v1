import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })

  let body: { code?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const code = body.code?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  try {
    const promo = await stripe.promotionCodes.list({ code, active: true, limit: 1, expand: ['data.coupon'] })
    const promoCode = promo.data[0]

    if (!promoCode) return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 404 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupon = (promoCode as any).coupon as { percent_off?: number; amount_off?: number; currency?: string }
    const discount = coupon.percent_off
      ? `${coupon.percent_off}% de descuento`
      : coupon.amount_off
        ? `${(coupon.amount_off / 100).toFixed(0)} ${coupon.currency?.toUpperCase()} de descuento`
        : 'Descuento aplicado'

    return NextResponse.json({
      valid: true,
      promotionCodeId: promoCode.id,
      discount,
    })
  } catch {
    return NextResponse.json({ error: 'Error al validar el cupón' }, { status: 500 })
  }
}
