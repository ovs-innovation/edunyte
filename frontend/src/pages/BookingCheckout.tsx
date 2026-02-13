import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Wrapper from '../layouts/Wrapper'
import SEO from '../components/SEO'
import HeaderOne from '../layouts/headers/HeaderOne'
import FooterOne from '../layouts/footers/FooterOne'
import { useCurrency } from '../hooks/useCurrency'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice } from '../services/currencyService'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

type BookingState = {
  availabilityId: string
  teacherCourseId: string
  courseId: string
  teacherId: string
  duration: number
  date: string
  startTime: string
  endTime: string
  timezone: string
  selectedCurrency?: string
  // Additional info for display
  teacherName?: string
  teacherPhoto?: string
  teacherRating?: number
  teacherReviews?: number
  teacherStudents?: number
  teacherLessons?: number
  teacherYearsTeaching?: number
  courseName?: string
  courseDescription?: string
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const CheckoutForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { t } = useTranslation()
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
        return_url: `${window.location.origin}/my-dashboard`,
      },
    })

    if (result.error) {
      setError(result.error.message || t('checkout.payment_failed'))
    } else {
      onSuccess?.()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <button className="btn btn-primary w-100 mt-4 py-3 fw-semibold" disabled={!stripe || !elements || submitting}>
        {submitting ? t('checkout.processing') : t('checkout.book_and_pay')}
      </button>
      <p className="text-muted small text-center mt-3 mb-0">
        {t('checkout.secure_payment_info')}
      </p>
    </form>
  )
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex gap-3 mb-3">
          <div className="bg-secondary rounded-circle" style={{ width: 80, height: 80 }}></div>
          <div className="flex-grow-1">
            <div className="bg-secondary rounded mb-2" style={{ height: 24, width: '40%' }}></div>
            <div className="bg-secondary rounded mb-2" style={{ height: 16, width: '60%' }}></div>
            <div className="bg-secondary rounded" style={{ height: 16, width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card-body">
        <div className="bg-secondary rounded mb-3" style={{ height: 20, width: '50%' }}></div>
        <div className="bg-secondary rounded mb-2" style={{ height: 16, width: '100%' }}></div>
        <div className="bg-secondary rounded" style={{ height: 16, width: '80%' }}></div>
      </div>
    </div>
  </div>
)

const BookingCheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currency } = useCurrency()
  const { token } = useAuth() as any

  const state = (location.state || null) as BookingState | null

  const [clientSecret, setClientSecret] = useState<string>('')
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState(1)

  const selectedCurrency = useMemo(() => state?.selectedCurrency || currency || 'USD', [state, currency])

  useEffect(() => {
    const run = async () => {
      if (!state?.availabilityId || !state?.courseId || !state?.teacherCourseId) {
        setError(t('checkout.missing_booking_details'))
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api'
        const resp = await fetch(`${API_BASE_URL}/payments/checkout/payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            teacherId: state.teacherId,
            courseId: state.courseId,
            duration: state.duration,
            selectedCurrency,
            selectedSlot: { availabilityId: state.availabilityId },
            studentCount, // Add number of students
          }),
        })
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}))
          throw new Error(data.message || t('checkout.failed_to_start'))
        }
        const data = await resp.json()
        setClientSecret(data.clientSecret)
        setPricing(data.pricing)
      } catch (e: any) {
        setError(e?.message || t('checkout.failed_to_start'))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [state, selectedCurrency, studentCount, token, t])

  if (!state) {
    return (
      <Wrapper>
        <SEO pageTitle={t('checkout.title')} />
        <HeaderOne />
        <main className="container py-5">
          <div className="alert alert-warning">
            {t('checkout.missing_booking_details')}
          </div>
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
            {t('common.go_back')}
          </button>
        </main>
        <FooterOne style={false} style_2={true} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <SEO pageTitle={t('checkout.title')} />
      <HeaderOne />
      <main className="container py-4 py-md-5 mb-5">
        <div className="row g-3 g-md-4">
          {/* Left Column - Tutor & Booking Info */}
          <div className="col-12 col-lg-5 order-1 order-lg-1">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Tutor Card */}
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2 text-uppercase small fw-semibold">{t('checkout.your_tutor')}</h6>
                    <div className="d-flex gap-3">
                      <div className="flex-shrink-0">
                        {state.teacherPhoto ? (
                          <img
                            src={state.teacherPhoto}
                            alt={state.teacherName || 'Tutor'}
                            className="rounded-circle"
                            style={{ width: 64, height: 64, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                            style={{ width: 64, height: 64 }}
                          >
                            <span className="fs-4 text-primary fw-bold">
                              {state.teacherName?.charAt(0) || 'T'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h5 className="mb-1 fw-bold text-truncate">{state.teacherName || t('checkout.tutor')}</h5>
                        {state.teacherRating ? (
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <span className="text-warning">★</span>
                            <span className="fw-semibold">{state.teacherRating.toFixed(1)}</span>
                            {state.teacherReviews ? (
                              <span className="text-muted small">({state.teacherReviews} {t('checkout.reviews')})</span>
                            ) : null}
                          </div>
                        ) : null}
                        {state.courseDescription ? (
                          <p className="text-muted small mb-0">{state.courseDescription}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trial Lesson Details - Calendar Style */}
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-body p-3">
                    <h5 className="fw-bold mb-3">{t('checkout.trial_lesson_details')}</h5>
                    <div className="d-flex gap-3 align-items-start mb-3 flex-wrap flex-sm-nowrap">
                      {/* Calendar Date Box */}
                      <div 
                        className="text-center flex-shrink-0"
                        style={{
                          minWidth: '70px',
                          padding: '12px 16px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <div className="text-primary text-uppercase small fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          {new Date(state.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="fw-bold" style={{ fontSize: '32px', lineHeight: '1.1', marginTop: '4px' }}>
                          {new Date(state.date).getDate()}
                        </div>
                      </div>
                      
                      {/* Time and Location Info */}
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-bold mb-1" style={{ fontSize: '16px' }}>
                          {new Date(state.date).toLocaleDateString('en-US', { weekday: 'long' })}, {state.startTime} – {state.endTime}
                        </div>
                        <div className="text-muted small">
                          {t('checkout.time_based_on_location')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cancellation Policy */}
                    <div 
                      className="p-2 text-center small"
                      style={{
                        backgroundColor: '#d1ecf1',
                        color: '#0c5460',
                        borderRadius: '6px'
                      }}
                    >
                      {t('checkout.free_cancellation_policy')}
                    </div>
                  </div>
                </div>

                {/* Number of Students Selector */}
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-3 text-uppercase small fw-semibold">{t('checkout.number_of_students') || 'Number of Students'}</h6>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">{t('checkout.students_attending') || 'Students attending this lesson'}</span>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', padding: 0 }}
                          onClick={() => setStudentCount(Math.max(1, studentCount - 1))}
                          disabled={studentCount <= 1}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="fw-bold fs-4 mx-2" style={{ minWidth: '40px', textAlign: 'center' }}>
                          {studentCount}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', padding: 0 }}
                          onClick={() => setStudentCount(studentCount + 1)}
                          disabled={studentCount >= 10}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {studentCount > 1 && (
                      <p className="text-muted small mb-0 mt-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1" style={{ verticalAlign: 'text-bottom' }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        {t('checkout.group_lesson_note', { count: studentCount }) || `Price will be calculated for ${studentCount} students`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkout Info */}
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2 text-uppercase small fw-semibold">{t('checkout.checkout_info')}</h6>
                    {pricing ? (
                      <>
                        {studentCount > 1 && (
                          <div className="bg-light p-2 rounded mb-2">
                            <div className="d-flex justify-content-between text-muted small">
                              <span>{t('checkout.per_student') || 'Per Student'}:</span>
                              <span>{formatPrice((pricing.lessonAmount || 0) / studentCount, pricing.selectedCurrency)}</span>
                            </div>
                          </div>
                        )}
                        <div className="d-flex justify-content-between mb-2">
                          <span>
                            {state.duration}-{t('checkout.min_lesson')}
                            {studentCount > 1 && <span className="text-muted small"> × {studentCount} {t('checkout.students_lowercase') || 'students'}</span>}
                          </span>
                          <span className="fw-semibold">
                            {formatPrice(pricing.lessonAmount || 0, pricing.selectedCurrency)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>{t('checkout.processing_fee')}</span>
                          <span className="fw-semibold">
                            {formatPrice(pricing.platformFee || 0, pricing.selectedCurrency)}
                          </span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{t('checkout.total')}</span>
                          <span className="fw-bold fs-5 text-primary">
                            {formatPrice(pricing.totalAmount || 0, pricing.selectedCurrency)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted">{t('checkout.calculating')}</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Payment */}
          <div className="col-12 col-lg-7 order-2 order-lg-2">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-md-4">
                <h5 className="fw-bold mb-4">{t('checkout.choose_payment_method')}</h5>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">{t('checkout.loading')}</span>
                    </div>
                    <p className="text-muted mt-3">{t('checkout.preparing_checkout')}</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : !clientSecret ? (
                  <div className="alert alert-danger">{t('checkout.missing_client_secret')}</div>
                ) : (
                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                      },
                    }}
                  >
                    <CheckoutForm />
                  </Elements>
                )}
              </div>
            </div>

            {/* Trust Indicators - Simple Text Above Footer */}
            {!loading && (
              <div className="mt-4 mb-4 pb-3 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span className="small fw-semibold">{t('checkout.ssl_encrypted')}</span>
                </div>
                <p className="text-muted small mb-2">
                  {t('checkout.secure_payment_info')}
                </p>
                <a 
                  href="#" 
                  className="text-primary text-decoration-none small"
                  style={{ borderBottom: '1px solid currentColor' }}
                >
                  {t('checkout.refund_policy_link')}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterOne style={false} style_2={true} />
    </Wrapper>
  )
}

export default BookingCheckoutPage
