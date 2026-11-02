import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
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
import {
  loadRazorpayScript,
  createRazorpayOrder,
  verifyRazorpayPayment,
  VerifyPaymentResponse,
} from '../services/razorpayService'

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

const StripeCheckoutForm = ({ onSuccess }: { onSuccess?: () => void }) => {
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
      setError(result.error.message || t('checkout.payment_failed') || 'Payment failed')
    } else {
      onSuccess?.()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <button className="btn btn-primary w-100 mt-4 py-3 fw-semibold shadow-sm" disabled={!stripe || !elements || submitting}>
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {t('checkout.processing') || 'Processing...'}
          </>
        ) : (
          t('checkout.book_and_pay') || 'Pay Now'
        )}
      </button>
      <p className="text-muted small text-center mt-3 mb-0">
        {t('checkout.secure_payment_info') || 'Payments are processed securely via SSL encryption.'}
      </p>
    </form>
  )
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex gap-3 mb-3">
          <div className="bg-secondary bg-opacity-25 rounded-circle" style={{ width: 80, height: 80 }}></div>
          <div className="flex-grow-1">
            <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ height: 24, width: '40%' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ height: 16, width: '60%' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded" style={{ height: 16, width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card-body">
        <div className="bg-secondary bg-opacity-25 rounded mb-3" style={{ height: 20, width: '50%' }}></div>
        <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ height: 16, width: '100%' }}></div>
        <div className="bg-secondary bg-opacity-25 rounded" style={{ height: 16, width: '80%' }}></div>
      </div>
    </div>
  </div>
)

const BookingCheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currency } = useCurrency()
  const { token, user } = useAuth() as any

  const state = (location.state || null) as BookingState | null

  const [clientSecret, setClientSecret] = useState<string>('')
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState(1)

  // Payment Gateway Selector: razorpay | stripe | free
  const [paymentType, setPaymentType] = useState<'razorpay' | 'stripe' | 'free'>('razorpay')
  const [isProcessingFree, setIsProcessingFree] = useState(false)

  // Razorpay Specific States
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false)
  const [isVerifyingRazorpay, setIsVerifyingRazorpay] = useState(false)
  const [razorpayNotice, setRazorpayNotice] = useState<string | null>(null)
  const [confirmedPayment, setConfirmedPayment] = useState<VerifyPaymentResponse | null>(null)

  const selectedCurrency = useMemo(() => state?.selectedCurrency || (currency && currency !== 'USD' ? currency : 'INR'), [state, currency])

  // Fetch initial pricing snapshot and Stripe clientSecret (if available)
  useEffect(() => {
    const run = async () => {
      if (!state?.availabilityId || !state?.courseId || !state?.teacherCourseId) {
        setError(t('checkout.missing_booking_details') || 'Missing booking details')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
        let resp = await fetch(`${API_BASE_URL}/payments/checkout/preview`, {
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
            studentCount,
          }),
        })

        if (!resp.ok) {
          // Fallback to payment-intent
          resp = await fetch(`${API_BASE_URL}/payments/checkout/payment-intent`, {
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
              studentCount,
            }),
          })
        }

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}))
          throw new Error(data.message || t('checkout.failed_to_start') || 'Failed to initialize checkout')
        }
        const data = await resp.json()
        setClientSecret(data.clientSecret || '')
        setPricing(data.pricing)
      } catch (e: any) {
        setError(e?.message || t('checkout.failed_to_start') || 'Failed to load checkout details')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [state, selectedCurrency, studentCount, token, t])

  // Pre-load Razorpay Checkout.js script on mount
  useEffect(() => {
    loadRazorpayScript().catch((err) => console.warn('Razorpay pre-load notice:', err))
  }, [])

  /**
   * Handle Razorpay Payment Flow
   */
  const handleRazorpayPayment = async () => {
    if (isProcessingRazorpay || isVerifyingRazorpay || !state) return

    try {
      setIsProcessingRazorpay(true)
      setRazorpayNotice(null)
      setError(null)

      // 1. Ensure Checkout.js script is loaded
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection.')
      }

      // 2. Call backend Create Order API
      const orderData = await createRazorpayOrder(
        {
          itemType: 'lesson',
          teacherId: state.teacherId,
          courseId: state.courseId,
          duration: state.duration,
          studentCount,
          selectedSlot: { availabilityId: state.availabilityId },
        },
        token
      )

      if (!orderData?.orderId || !orderData?.keyId) {
        throw new Error('Backend failed to return order details or Razorpay key ID.')
      }

      // 3. Configure Razorpay Checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'Edunyte',
        description: `${state.duration}-Min Class with ${state.teacherName || 'Teacher'}`,
        image: '/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || orderData.user?.name || '',
          email: user?.email || orderData.user?.email || '',
          contact: (user as any)?.phone || '',
        },
        notes: {
          teacherId: state.teacherId,
          courseId: state.courseId,
          availabilityId: state.availabilityId,
          studentCount: String(studentCount),
        },
        theme: {
          color: '#5f2ded', // Edunyte brand accent
        },
        modal: {
          backdropclose: false,
          escape: false,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            setIsProcessingRazorpay(false)
            setRazorpayNotice('Payment was cancelled. You can retry whenever you are ready.')
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            setIsVerifyingRazorpay(true)
            setRazorpayNotice('Verifying payment with bank servers. Please do not refresh...')

            // 4. Call backend Payment Verification API
            const verifyResult = await verifyRazorpayPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              token
            )

            // 5. Show confirmed payment success screen
            setConfirmedPayment(verifyResult)
            setRazorpayNotice(null)
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr)
            setError(
              verifyErr.message ||
                'Payment was captured by bank but backend verification failed. Please contact support with Order ID: ' +
                  response.razorpay_order_id
            )
          } finally {
            setIsVerifyingRazorpay(false)
            setIsProcessingRazorpay(false)
          }
        },
      }

      // 4. Open Razorpay Checkout modal
      const rzpInstance = new window.Razorpay(options)

      rzpInstance.on('payment.failed', (resp: any) => {
        console.error('Razorpay payment failed:', resp?.error)
        setIsProcessingRazorpay(false)
        setError(
          resp?.error?.description ||
            'Payment failed or was declined by bank. Please try again with another payment method.'
        )
      })

      rzpInstance.open()
    } catch (err: any) {
      console.error('Error initiating Razorpay checkout:', err)
      setError(err?.message || 'Could not initiate Razorpay checkout. Please try again.')
      setIsProcessingRazorpay(false)
    }
  }

  /**
   * Handle Free Class Booking Flow
   */
  const handleFreeBooking = async () => {
    try {
      setIsProcessingFree(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
      const resp = await fetch(`${API_BASE_URL}/payments/checkout/free-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          teacherId: state?.teacherId,
          courseId: state?.courseId,
          duration: state?.duration,
          selectedCurrency,
          selectedSlot: { availabilityId: state?.availabilityId },
          studentCount,
        }),
      })

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to book free class')
      }

      navigate('/my-dashboard')
    } catch (e: any) {
      setError(e?.message || 'Failed to book free class')
    } finally {
      setIsProcessingFree(false)
    }
  }

  // Fallback for missing booking context
  if (!state) {
    return (
      <Wrapper>
        <SEO pageTitle={t('checkout.title') || 'Checkout'} />
        <HeaderOne />
        <main className="container py-5">
          <div className="alert alert-warning">
            {t('checkout.missing_booking_details') || 'Booking details not found. Please select a teacher and schedule first.'}
          </div>
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
            {t('common.go_back') || 'Go Back'}
          </button>
        </main>
        <FooterOne style={false} style_2={true} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <SEO pageTitle={t('checkout.title') || 'Checkout - Edunyte'} />
      <HeaderOne />
      <main className="container py-4 py-md-5 mb-5">
        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION VIEW (AFTER BACKEND VERIFICATION)   */}
        {/* ========================================================= */}
        {confirmedPayment ? (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-7">
              <div className="card shadow border-0 rounded-4 p-4 p-md-5 text-center">
                <div
                  className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 bg-success bg-opacity-10 text-success"
                  style={{ width: '80px', height: '80px' }}
                >
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>

                <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mx-auto mb-2">
                  Payment Confirmed & Verified
                </span>
                <h3 className="fw-bold mb-2">Booking Confirmed!</h3>
                <p className="text-muted mb-4">
                  Thank you, <strong>{user?.name || 'Student'}</strong>! Your live session has been confirmed and scheduled.
                </p>

                {/* Session Details Box */}
                <div className="bg-light p-3 p-md-4 rounded-3 text-start mb-4 border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Course / Lesson:</span>
                    <span className="fw-semibold text-end">{state.courseName || 'Live Lesson'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Teacher:</span>
                    <span className="fw-semibold">{state.teacherName || 'Tutor'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Date & Time:</span>
                    <span className="fw-semibold text-end">
                      {new Date(state.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {state.startTime} – {state.endTime}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Students Attending:</span>
                    <span className="fw-semibold">{studentCount} student{studentCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Amount Paid:</span>
                    <span className="fw-bold text-success">
                      ₹{confirmedPayment.amount?.toLocaleString('en-IN') || pricing?.totalAmount} {confirmedPayment.currency || 'INR'}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Payment ID:</span>
                    <span className="font-monospace">{confirmedPayment.paymentId}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Order ID:</span>
                    <span className="font-monospace">{confirmedPayment.orderId}</span>
                  </div>
                </div>

                {/* Join Meeting Link (if available) */}
                {confirmedPayment.service?.meetingUrl && (
                  <div className="mb-4">
                    <a
                      href={confirmedPayment.service.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                      Join Class Meeting
                    </a>
                  </div>
                )}

                {/* Dashboard Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <Link to="/my-dashboard" className="btn btn-primary py-2 px-4 fw-semibold rounded-3">
                    Go to My Dashboard
                  </Link>
                  <Link to="/my-lessions" className="btn btn-outline-secondary py-2 px-4 fw-semibold rounded-3">
                    View My Lessons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MAIN CHECKOUT FORM VIEW                                  */
          /* ========================================================= */
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
                      <h6 className="text-muted mb-2 text-uppercase small fw-semibold">{t('checkout.your_tutor') || 'Your Tutor'}</h6>
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
                          <h5 className="mb-1 fw-bold text-truncate">{state.teacherName || t('checkout.tutor') || 'Tutor'}</h5>
                          {state.teacherRating ? (
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="text-warning">★</span>
                              <span className="fw-semibold">{state.teacherRating.toFixed(1)}</span>
                              {state.teacherReviews ? (
                                <span className="text-muted small">({state.teacherReviews} {t('checkout.reviews') || 'reviews'})</span>
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

                  {/* Lesson Details - Calendar Style */}
                  <div className="card shadow-sm border-0 mb-3">
                    <div className="card-body p-3">
                      <h5 className="fw-bold mb-3">{t('checkout.trial_lesson_details') || 'Session Details'}</h5>
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
                        
                        {/* Time & Timezone Info */}
                        <div className="flex-grow-1 min-w-0">
                          <div className="fw-bold mb-1" style={{ fontSize: '16px' }}>
                            {new Date(state.date).toLocaleDateString('en-US', { weekday: 'long' })}, {state.startTime} – {state.endTime}
                          </div>
                          <div className="text-muted small">
                            {t('checkout.time_based_on_location') || 'Time adjusted for your local timezone'} ({state.timezone || 'Local'})
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
                        {t('checkout.free_cancellation_policy') || 'Free cancellation up to 12 hours before class start'}
                      </div>
                    </div>
                  </div>

                  {/* Student Count Selector */}
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
                            disabled={studentCount <= 1 || isProcessingRazorpay}
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
                            disabled={studentCount >= 10 || isProcessingRazorpay}
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
                          {t('checkout.group_lesson_note', { count: studentCount }) || `Total price calculated for ${studentCount} students`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkout Summary */}
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-3">
                      <h6 className="text-muted mb-2 text-uppercase small fw-semibold">{t('checkout.checkout_info') || 'Order Summary'}</h6>
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
                              {state.duration}-{t('checkout.min_lesson') || 'min lesson'}
                              {studentCount > 1 && <span className="text-muted small"> × {studentCount} {t('checkout.students_lowercase') || 'students'}</span>}
                            </span>
                            <span className="fw-semibold">
                              {formatPrice(pricing.lessonAmount || 0, pricing.selectedCurrency)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>{t('checkout.processing_fee') || 'Platform & Processing Fee'}</span>
                            <span className="fw-semibold">
                              {formatPrice(pricing.platformFee || 0, pricing.selectedCurrency)}
                            </span>
                          </div>
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{t('checkout.total') || 'Total Amount'}</span>
                            <span className="fw-bold fs-5 text-primary">
                              {formatPrice(pricing.totalAmount || 0, pricing.selectedCurrency)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted">{t('checkout.calculating') || 'Calculating price...'}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Payment Gateways */}
            <div className="col-12 col-lg-7 order-2 order-lg-2">
              <div className="card shadow-sm border-0">
                <div className="card-body p-3 p-md-4">
                  <h5 className="fw-bold mb-4">{t('checkout.choose_payment_method') || 'Choose Payment Method'}</h5>
                  
                  {/* Payment Method Badge Banner */}
                  <div className="mb-4">
                    <div className="p-3 rounded-3 border border-primary bg-primary bg-opacity-10 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-circle bg-primary text-white">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                              <path d="M7 15h0M2 9.5h20"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="fw-bold fs-6 d-flex align-items-center gap-2">
                              Razorpay
                              <span className="badge bg-primary px-2 py-1 text-white small" style={{ fontSize: '10px' }}>
                                UPI • Cards • NetBanking • Wallets
                              </span>
                            </div>
                            <div className="text-muted small">
                              Google Pay, PhonePe, Paytm, Major Cards, Net Banking & Cred
                            </div>
                          </div>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1">
                          Fast & Secure
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Notifications */}
                  {razorpayNotice && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <div>{razorpayNotice}</div>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>{error}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setError(null)}
                      ></button>
                    </div>
                  )}

                  {/* Loading State Indicator */}
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('checkout.loading') || 'Loading...'}</span>
                      </div>
                      <p className="text-muted mt-3">{t('checkout.preparing_checkout') || 'Preparing checkout...'}</p>
                    </div>
                  ) : (
                    /* ======================================== */
                    /* RAZORPAY PAYMENT VIEW                    */
                    /* ======================================== */
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="fw-bold mb-1">Pay with Razorpay</h6>
                          <p className="text-muted small mb-0">
                            Supports Instant UPI, Debit/Credit Cards, Net Banking & Wallets
                          </p>
                        </div>
                        <div className="text-end">
                          <div className="text-muted small">Total Payable</div>
                          <div className="fw-bold fs-5 text-primary">
                            {pricing ? formatPrice(pricing.totalAmount || 0, pricing.selectedCurrency) : '...'}
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods Visual Badges */}
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        <span className="badge bg-white text-dark border px-2 py-1 small">📱 Google Pay / PhonePe / Paytm</span>
                        <span className="badge bg-white text-dark border px-2 py-1 small">💳 Visa / MasterCard / RuPay</span>
                        <span className="badge bg-white text-dark border px-2 py-1 small">🏦 NetBanking (50+ Banks)</span>
                        <span className="badge bg-white text-dark border px-2 py-1 small">👛 Wallets & EMI</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={handleRazorpayPayment}
                        disabled={isProcessingRazorpay || isVerifyingRazorpay || loading}
                      >
                        {isVerifyingRazorpay ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Verifying Payment...
                          </>
                        ) : isProcessingRazorpay ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Connecting to Razorpay...
                          </>
                        ) : (
                          <>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Pay Now ({pricing ? formatPrice(pricing.totalAmount || 0, pricing.selectedCurrency) : 'Securely'})
                          </>
                        )}
                      </button>

                      <p className="text-muted small text-center mt-3 mb-0">
                        🔒 Official 256-bit encrypted Razorpay Checkout. Never stores confidential pin or passwords.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Indicators */}
              {!loading && (
                <div className="mt-4 mb-4 pb-3 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span className="small fw-semibold">{t('checkout.ssl_encrypted') || '256-Bit SSL Bank Grade Encryption'}</span>
                  </div>
                  <p className="text-muted small mb-2">
                    {t('checkout.secure_payment_info') || 'Your payment details are protected under PCI-DSS compliance.'}
                  </p>
                  <Link 
                    to="/terms-and-conditions" 
                    className="text-primary text-decoration-none small"
                    style={{ borderBottom: '1px solid currentColor' }}
                  >
                    {t('checkout.refund_policy_link') || 'Cancellation & Refund Policy'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <FooterOne style={false} style_2={true} />
    </Wrapper>
  )
}

export default BookingCheckoutPage
