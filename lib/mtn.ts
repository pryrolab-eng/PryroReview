const BASE_URL = process.env.MTN_BASE_URL!
const SUB_KEY = process.env.MTN_SUBSCRIPTION_KEY!
const API_USER = process.env.MTN_API_USER!
const API_KEY = process.env.MTN_API_KEY!
const ENV = process.env.MTN_ENVIRONMENT!

export async function getMtnAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64')
  const res = await fetch(`${BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': SUB_KEY,
    },
  })
  const data = await res.json()
  return data.access_token
}

export async function requestMtnPayment(
  phone: string,
  referenceId: string,
  externalId: string,
  companyName: string
): Promise<boolean> {
  const token = await getMtnAccessToken()
  const msisdn = phone.startsWith('0') ? `250${phone.slice(1)}` : phone
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': ENV,
      'Ocp-Apim-Subscription-Key': SUB_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '100',
      currency: 'RWF',
      externalId,
      payer: { partyIdType: 'MSISDN', partyId: msisdn },
      payerMessage: 'Pryro Review payment',
      payeeNote: `Review payment for ${companyName}`,
    }),
  })
  return res.status === 202
}

export async function checkMtnPaymentStatus(
  referenceId: string
): Promise<'SUCCESSFUL' | 'FAILED' | 'PENDING'> {
  const token = await getMtnAccessToken()
  const res = await fetch(
    `${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': ENV,
        'Ocp-Apim-Subscription-Key': SUB_KEY,
      },
    }
  )
  const data = await res.json()
  return data.status
}
