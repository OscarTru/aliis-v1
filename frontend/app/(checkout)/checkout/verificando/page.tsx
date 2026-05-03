import { VerifyStandby } from './VerifyStandby'

const VALID_PRICE_KEYS = [
  'eur_monthly', 'eur_yearly',
  'usd_monthly', 'usd_yearly',
  'mxn_monthly', 'mxn_yearly',
]

export default async function VerificandoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; email?: string }>
}) {
  const { plan, email } = await searchParams
  const priceKey = VALID_PRICE_KEYS.includes(plan ?? '') ? plan! : 'eur_monthly'
  return <VerifyStandby priceKey={priceKey} email={email ?? ''} />
}
