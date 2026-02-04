
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { getMyBookings, Booking } from "../../../services/bookingService"

const StudentHistoryContent = () => {
   const { token } = useAuth()
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
         return typeof name === 'object' ? name.en : name || 'Course'
      }
      return 'Course'
   }

   const getTeacherName = (booking: Booking) => {
      if (booking.teacherId && typeof booking.teacherId === 'object') {
         return (booking.teacherId as any).name || 'Teacher'
      }
      return 'Teacher'
   }

   if (loading) return <div>Loading...</div>

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">Booking History</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="dashboard__review-table">
                     <table className="table table-borderless">
                        <thead>
                           <tr>
                              <th>Booking ID</th>
                              <th>Course Name</th>
                              <th>Date</th>
                              <th>Teacher</th>
                              <th>Payment Status</th>
                              <th>Status</th>
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
                                       <span className={`dashboard__quiz-result ${item.paymentStatus === 'paid' ? 'color-success' : 'color-warning'}`}>
                                          {item.paymentStatus}
                                       </span>
                                    </td>
                                    <td>
                                       <span className={`dashboard__quiz-result color-info`}>{item.status || 'Scheduled'}</span>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan={6} className="text-center">No bookings found</td>
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
