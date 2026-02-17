import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../contexts/AuthContext"
import { getMyBookings, Booking } from "../../../services/bookingService"

const StudentHistoryContent = () => {
   const { token } = useAuth()
   const { t } = useTranslation()
   const [bookings, setBookings] = useState<Booking[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchData = async () => {
         if (token) {
            try {
               const data = await getMyBookings(token)
               setBookings(data)
            } catch (error) {
               console.error("Failed to fetch bookings:", error)
            } finally {
               setLoading(false)
            }
         }
      }
      fetchData()
   }, [token])

   const getCourseName = (booking: Booking) => {
      if (booking.courseId && typeof booking.courseId === 'object') {
         const courseObj = booking.courseId as any
         const name = courseObj.name
         return typeof name === 'object' ? name.en : name || t('common.course')
      }
      return t('common.course')
   }

   const getTeacherName = (booking: Booking) => {
      if (booking.teacherId && typeof booking.teacherId === 'object') {
         return (booking.teacherId as any).name || t('checkout.tutor')
      }
      return t('checkout.tutor')
   }

   const getStatusStyle = (status: string) => {
      const lowerStatus = status?.toLowerCase() || '';
      const baseStyle = {
         padding: '5px 12px',
         borderRadius: '30px',
         fontWeight: '500',
         display: 'inline-block',
         textTransform: 'capitalize' as const,
         fontSize: '13px'
      };

      if (['paid', 'completed', 'verified'].includes(lowerStatus)) {
         return { ...baseStyle, color: 'var(--tg-common-color-green)', background: 'rgba(18, 187, 106, 0.1)' };
      }
      if (['cancelled', 'no_show', 'rejected', 'failed'].includes(lowerStatus)) {
         return { ...baseStyle, color: 'var(--tg-common-color-red)', background: 'rgba(225, 27, 36, 0.1)' };
      }
      if (['scheduled', 'pending', 'available'].includes(lowerStatus)) {
         return { ...baseStyle, color: 'var(--tg-common-color-blue)', background: 'rgba(40, 37, 104, 0.1)' }; // Using blue-2 or standard blue
      }
      // Default / Warning
      return { ...baseStyle, color: 'var(--tg-common-color-orange)', background: 'rgba(253, 126, 20, 0.1)' };
   }

   if (loading) return <div>{t('common.loading')}</div>

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">{t('dashboard.booking_history')}</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="dashboard__review-table">
                     <table className="table table-borderless">
                        <thead>
                           <tr>
                              <th>{t('dashboard.booking_id')}</th>
                              <th>{t('dashboard.course_name')}</th>
                              <th>{t('dashboard.date')}</th>
                              <th>{t('dashboard.teacher')}</th>
                              <th>{t('dashboard.students')}</th>
                              <th>{t('dashboard.price')}</th>
                              <th>{t('dashboard.payment_status')}</th>
                              <th>{t('dashboard.status')}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {bookings.length > 0 ? (
                              bookings.map((item) => (
                                 <tr key={item._id}>
                                    <td>
                                       <p>#{item._id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td>
                                       <p>{getCourseName(item)}</p>
                                    </td>
                                    <td>
                                       <p>{new Date(item.lesson.scheduledAt).toLocaleDateString()}</p>
                                    </td>
                                    <td>
                                       <p>{getTeacherName(item)}</p>
                                    </td>
                                    <td>
                                       <p style={{ fontWeight: '600', color: 'var(--tg-theme-primary)' }}>
                                          {(item as any).studentCount || 1} {((item as any).studentCount || 1) === 1 ? t('dashboard.student') : t('dashboard.students')}
                                       </p>
                                    </td>
                                    <td>
                                       <p style={{ fontWeight: '600', color: 'var(--tg-common-color-green)' }}>
                                          {(item as any).pricingSnapshot?.studentPaid ?
                                             new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: (item as any).pricingSnapshot.studentPaid.currency || 'INR'
                                             }).format((item as any).pricingSnapshot.studentPaid.amount || 0)
                                             : 'N/A'
                                          }
                                       </p>
                                    </td>
                                    <td>
                                       <span style={getStatusStyle(item.paymentStatus)}>
                                          {item.paymentStatus}
                                       </span>
                                    </td>
                                    <td>
                                       <span style={getStatusStyle(item.status || 'scheduled')}>
                                          {item.status || t('dashboard.scheduled')}
                                       </span>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan={8} className="text-center">{t('dashboard.no_bookings_found')}</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default StudentHistoryContent
