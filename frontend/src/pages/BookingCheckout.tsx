import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Wrapper from '../layouts/Wrapper'
import SEO from '../components/SEO'
import HeaderOne from '../layouts/headers/HeaderOne'
import FooterOne from '../layouts/footers/FooterOne'
import { useCurrency } from '../hooks/useCurrency'
import { useAuth } from '../contexts/AuthContext'

import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

type BookingState = {
  availabilityId: string
  teacherCourseId: string
  courseId: string
  duration: number
  date: string
  startTime: string
  endTime: string
  timezone: string
  // from new booking modal
  selectedCurrency?: string
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // payment confirmation happens via webhook; we keep user on page with a simple success UI
        return_url: `${window.location.origin}/student-dashboard`,
      },
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <button className="btn btn-primary w-100 mt-3" disabled={!stripe || !elements || submitting}>
        {submitting ? 'Processing…' : 'Pay & Book'}
      </button>
      <p className="text-muted small mt-2 mb-0">
        Your booking is created only after Stripe confirms payment (webhook).
      </p>
    </form>
  )
}

const BookingCheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currency } = useCurrency()
  const { token } = useAuth() as any

  const state = (location.state || null) as BookingState | null

  const [clientSecret, setClientSecret] = useState<string>('')
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedCurrency = useMemo(() => state?.selectedCurrency || currency || 'USD', [state, currency])

  useEffect(() => {
    const run = async () => {
      if (!state?.availabilityId || !state?.courseId || !state?.teacherCourseId) {
        setError('Missing booking selection. Please select a slot again.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)

        // We intentionally do NOT send any price from client.
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api'
        const resp = await fetch(`${API_BASE_URL}/payments/checkout/payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            teacherId: (location.state as any)?.teacherId,
            courseId: state.courseId,
            duration: state.duration,
            selectedCurrency,
            selectedSlot: { availabilityId: state.availabilityId },
          }),
        })
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to start checkout')
        }
        const data = await resp.json()
        setClientSecret(data.clientSecret)
        setPricing(data.pricing)
      } catch (e: any) {
        setError(e?.message || 'Failed to start checkout')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [state, selectedCurrency, token, location.state])

  if (!state) {
    return (
      <Wrapper>
        <SEO pageTitle={'Checkout'} />
        <HeaderOne />
        <main className="container py-5">
          <div className="alert alert-warning">
            Missing booking details. Please go back to the course page and select a slot again.
          </div>
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
            Go back
          </button>
        </main>
        <FooterOne style={false} style_2={true} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <SEO pageTitle={'Pricing & Checkout'} />
      <HeaderOne />
      <main className="container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Trial lesson details</h5>
                <div className="small text-muted mb-2">Duration</div>
                <div className="fw-semibold mb-3">{state.duration} mins</div>
                <div className="small text-muted mb-2">Scheduled</div>
                <div className="fw-semibold mb-1">
                  {new Date(state.date).toLocaleDateString()} {state.startTime} – {state.endTime}
                </div>
                <div className="text-muted small">Timezone: {state.timezone}</div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Price breakdown</h6>
                {pricing ? (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Lesson price</span>
                      <span className="fw-semibold">
                        {pricing.selectedCurrency} {pricing.lessonAmount?.toFixed?.(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Platform fee ({pricing.platformFeePercent}%)</span>
                      <span className="fw-semibold">
                        {pricing.selectedCurrency} {pricing.platformFee?.toFixed?.(2)}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Total payable</span>
                      <span className="fw-bold text-primary">
                        {pricing.selectedCurrency} {pricing.totalAmount?.toFixed?.(2)}
                      </span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                      Prices are calculated in USD first and converted for display. Final charge is server-calculated.
                    </p>
                  </>
                ) : (
                  <div className="text-muted">—</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Checkout</h5>
                {loading ? (
                  <div className="text-muted">Preparing secure checkout…</div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : !clientSecret ? (
                  <div className="alert alert-danger">Missing Stripe client secret.</div>
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterOne style={false} style_2={true} />
    </Wrapper>
  )
}

export default BookingCheckoutPage


