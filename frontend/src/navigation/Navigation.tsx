import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
const Home = React.lazy(() => import('../pages/Home'));
const HomeTwo = React.lazy(() => import('../pages/HomeTwo'));
const HomeEight = React.lazy(() => import('../pages/HomeEight'));
const HomeSeven = React.lazy(() => import('../pages/HomeSeven'));
const HomeSix = React.lazy(() => import('../pages/HomeSix'));
const HomeFive = React.lazy(() => import('../pages/HomeFive'));
const HomeFour = React.lazy(() => import('../pages/HomeFour'));
const HomeThree = React.lazy(() => import('../pages/HomeThree'));
const Course = React.lazy(() => import('../pages/Course'));
const Lesson = React.lazy(() => import('../pages/Lesson'));
const CourseDetails = React.lazy(() => import('../pages/CourseDetails'));
const About = React.lazy(() => import('../pages/About'));
const Instructor = React.lazy(() => import('../pages/Instructor'));
const InstructorDetails = React.lazy(() => import('../pages/InstructorDetails'));
const Event = React.lazy(() => import('../pages/Event'));
const EventDetails = React.lazy(() => import('../pages/EventDetails'));
const Shop = React.lazy(() => import('../pages/Shop'));
const ShopDetails = React.lazy(() => import('../pages/ShopDetails'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Wishlist = React.lazy(() => import('../pages/Wishlist'));
const CheckOut = React.lazy(() => import('../pages/CheckOut'));
const Blog = React.lazy(() => import('../pages/Blog'));
const BlogTwo = React.lazy(() => import('../pages/BlogTwo'));
const BlogThree = React.lazy(() => import('../pages/BlogThree'));
const BlogDetails = React.lazy(() => import('../pages/BlogDetails'));
const Login = React.lazy(() => import('../pages/Login'));
const Registration = React.lazy(() => import('../pages/Registration'));
const Contact = React.lazy(() => import('../pages/Contact'));
const InstructorDashboard = React.lazy(() => import('../pages/InstructorDashboard'));
const InstructorProfile = React.lazy(() => import('../pages/InstructorProfile'));
const InstructorEnrollCourse = React.lazy(() => import('../pages/InstructorEnrolledCourses'));
const InstructorWishlist = React.lazy(() => import('../pages/InstructorWishlist'));
const InstructorReview = React.lazy(() => import('../pages/InstructorReview'));
const InstructorQuiz = React.lazy(() => import('../pages/InstructorQuiz'));
const InstructorHistory = React.lazy(() => import('../pages/InstructorHistory'));
const InstructorCourses = React.lazy(() => import('../pages/InstructorCourses'));
const InstructorAnnouncement = React.lazy(() => import('../pages/InstructorAnnouncement'));
const InstructorAssignment = React.lazy(() => import('../pages/InstructorAssignment'));
const InstructorSetting = React.lazy(() => import('../pages/InstructorSetting'));
const InstructorAttempt = React.lazy(() => import('../pages/InstructorAttempt'));
const StudentDashboard = React.lazy(() => import('../pages/StudentDashboard'));
const StudentProfile = React.lazy(() => import('../pages/StudentProfile'));
const MyLessions = React.lazy(() => import('../pages/MyLessions'));
const StudentWishlist = React.lazy(() => import('../pages/StudentWishlist'));
const StudentReview = React.lazy(() => import('../pages/StudentReview'));
const StudentAttempt = React.lazy(() => import('../pages/StudentAttempt'));
const StudentHistory = React.lazy(() => import('../pages/StudentHistory'));
const StudentSetting = React.lazy(() => import('../pages/StudentSetting'));
const BookingCheckout = React.lazy(() => import('../pages/BookingCheckout'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
import ProtectedRoute from '../components/common/ProtectedRoute';
const FaqOnePage = React.lazy(() => import('../pages/Faq'));
const OurValues = React.lazy(() => import('../pages/OurValues'));
const OurAdvisoryBoard = React.lazy(() => import('../pages/OurAdvisoryBoard'));
const OurPartners = React.lazy(() => import('../pages/OurPartners'));
const WorkAtFutureLearn = React.lazy(() => import('../pages/WorkAtFutureLearn'));
const QuizletPlus = React.lazy(() => import('../pages/QuizletPlus'));
const BecomeTeacher = React.lazy(() => import('../pages/BecomeTeacher'));
const BecomeStudent = React.lazy(() => import('../pages/BecomeStudent'));
// const BecomePartner = React.lazy(() => import('../pages/BecomePartner'));

const AppNavigation = () => {
  return (
    <Suspense fallback={<div className="preloader-lazy" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home-two" element={<HomeTwo />} />
        <Route path="/home-three" element={<HomeThree />} />
        <Route path="/home-four" element={<HomeFour />} />
        <Route path="/home-five" element={<HomeFive />} />
        <Route path="/home-six" element={<HomeSix />} />
        <Route path="/home-seven" element={<HomeSeven />} />
        <Route path="/home-eight" element={<HomeEight />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/course/:slug" element={<CourseDetails />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/instructors" element={<Instructor />} />
        <Route path="/instructor-details" element={<InstructorDetails />} />
        <Route path="/events" element={<Event />} />
        <Route path="/events-details" element={<EventDetails />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop-details" element={<ShopDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog-2" element={<BlogTwo />} />
        <Route path="/blog-3" element={<BlogThree />} />
        <Route path="/blog-details" element={<BlogDetails />} />
        <Route path="/login" element={<Login role="student" />} />
        <Route path="/student/login" element={<Login role="student" />} />
        <Route path="/instructor/login" element={<Login role="instructor" />} />
        <Route path="/registration" element={<Registration role="student" />} />
        <Route path="/student/registration" element={<Registration role="student" />} />
        <Route path="/instructor/registration" element={<Registration role="instructor" />} />
        <Route path="/instructor-profile" element={<InstructorProfile />} />
        <Route path="/instructor-enrolled-courses" element={<InstructorEnrollCourse />} />
        <Route path="/instructor-wishlist" element={<InstructorWishlist />} />
        <Route path="/instructor-review" element={<InstructorReview />} />
        <Route path="/instructor-attempts" element={<InstructorAttempt />} />
        <Route path="/instructor-history" element={<InstructorHistory />} />
        <Route path="/instructor-courses" element={<InstructorCourses />} />
        <Route path="/instructor-announcement" element={<InstructorAnnouncement />} />
        <Route path="/instructor-quiz" element={<InstructorQuiz />} />
        <Route path="/instructor-assignment" element={<InstructorAssignment />} />
        <Route path="/instructor-setting" element={<InstructorSetting />} />
               <Route path="/my-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
               <Route path="/my-profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
               <Route path="/my-lessions" element={<ProtectedRoute><MyLessions /></ProtectedRoute>} />
               <Route path="/my-wishlist" element={<ProtectedRoute><StudentWishlist /></ProtectedRoute>} />
               <Route path="/my-review" element={<ProtectedRoute><StudentReview /></ProtectedRoute>} />
               <Route path="/my-attempts" element={<ProtectedRoute><StudentAttempt /></ProtectedRoute>} />
               <Route path="/my-history" element={<ProtectedRoute><StudentHistory /></ProtectedRoute>} />
               <Route path="/my-profile-setting" element={<ProtectedRoute><StudentSetting /></ProtectedRoute>} />
        <Route path="/faq-one" element={<FaqOnePage />} />
        <Route path="/booking/checkout" element={<ProtectedRoute><BookingCheckout /></ProtectedRoute>} />
        <Route path="/our-values" element={<OurValues />} />
        <Route path="/our-advisory-board" element={<OurAdvisoryBoard />} />
        <Route path="/our-partners" element={<OurPartners />} />
        <Route path="/work-at-future-learn" element={<WorkAtFutureLearn />} />
        <Route path="/quizlet-plus" element={<QuizletPlus />} />
        <Route path="/become-teacher" element={<BecomeTeacher />} />
        <Route path="/become-student" element={<BecomeStudent />} />
        {/* <Route path="/become-partner" element={<BecomePartner />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppNavigation;
