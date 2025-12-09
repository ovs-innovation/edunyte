import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingConfirmationEmail = async (booking, guest, roomDetails = null) => {
  try {
    const isMultiRoom = booking.rooms && booking.rooms.length > 0;
    const roomNumbers = isMultiRoom 
      ? booking.rooms.map(r => r.room?.roomNumber || 'N/A').join(', ')
      : booking.room?.roomNumber || 'N/A';
    
    const roomCount = isMultiRoom ? booking.rooms.length : 1;
    const totalGuests = isMultiRoom 
      ? booking.rooms.reduce((sum, r) => sum + (r.numberOfAdults || 0) + (r.numberOfChildren || 0), 0)
      : (booking.numberOfAdults || 0) + (booking.numberOfChildren || 0);

    // Get check-in and check-out dates
    const checkInDate = isMultiRoom 
      ? booking.rooms.map(r => new Date(r.checkInDate)).sort((a,b) => a-b)[0]
      : new Date(booking.checkInDate);
    const checkOutDate = isMultiRoom 
      ? booking.rooms.map(r => new Date(r.checkOutDate)).sort((a,b) => b-a)[0]
      : new Date(booking.checkOutDate);

    const paymentStatus = booking.paymentDetails?.status || 'Paid';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guest.email,
      subject: `Booking Confirmation - ${roomNumbers} | ${guest.firstName} ${guest.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f7f7f7; padding: 32px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1a73e8; margin-bottom: 8px;">🎉 Booking Confirmed!</h1>
              <p style="color: #666; font-size: 16px;">Your hotel reservation has been successfully confirmed</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 24px;">Thank you for choosing our hotel! We're excited to welcome you. Here are your booking details:</p>
            
            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #1a73e8;">
              <h3 style="color: #1a73e8; margin-bottom: 16px;">📋 Booking Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <p style="margin: 8px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
                  <p style="margin: 8px 0;"><strong>Room Number(s):</strong> ${roomNumbers}</p>
                  <p style="margin: 8px 0;"><strong>Number of Rooms:</strong> ${roomCount}</p>
                  <p style="margin: 8px 0;"><strong>Total Guests:</strong> ${totalGuests}</p>
                </div>
                <div>
                  <p style="margin: 8px 0;"><strong>Check-in Date:</strong> ${checkInDate.toLocaleDateString()}</p>
                  <p style="margin: 8px 0;"><strong>Check-out Date:</strong> ${checkOutDate.toLocaleDateString()}</p>
                  <p style="margin: 8px 0;"><strong>Duration:</strong> ${Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} night(s)</p>
                  <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">${booking.status}</span></p>
                </div>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #333; margin-bottom: 16px;">💰 Payment Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <p style="margin: 8px 0;"><strong>Room Base Price:</strong> ₹${booking.rooms.reduce((sum, room) => sum + (room.totalPrice || 0), 0) || 0}</p>
                  <p style="margin: 8px 0;"><strong>Taxes:</strong> ₹${booking.taxes || 0}</p>
                  <p style="margin: 8px 0;"><strong>Discount:</strong> ₹${booking.discount || 0}</p>
                  <p style="margin: 8px 0;"><strong>Meal Plan:</strong> ₹${booking.mealPlan?.totalCost || 0}</p>
                  <p style="margin: 8px 0;"><strong>Grand Total:</strong> ₹${booking.grandTotal || booking.totalPrice || 0}</p>
                </div>
                <div>
                  <p style="margin: 8px 0;"><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">${paymentStatus}</span></p>
                </div>
              </div>
            </div>

            ${isMultiRoom ? `
            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #333; margin-bottom: 16px;">🏨 Room Details</h3>
              ${booking.rooms.map((room, index) => `
                <div style="border: 1px solid #ddd; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                  <h4 style="color: #1a73e8; margin-bottom: 8px;">Room ${index + 1}</h4>
                  <p style="margin: 4px 0;"><strong>Room Number:</strong> ${room.room?.roomNumber || 'N/A'}</p>
                  <p style="margin: 4px 0;"><strong>Check-in:</strong> ${new Date(room.checkInDate).toLocaleDateString()}</p>
                  <p style="margin: 4px 0;"><strong>Check-out:</strong> ${new Date(room.checkOutDate).toLocaleDateString()}</p>
                  <p style="margin: 4px 0;"><strong>Adults:</strong> ${room.numberOfAdults || 1}</p>
                  <p style="margin: 4px 0;"><strong>Children:</strong> ${room.numberOfChildren || 0}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div style="background: #e8f5e8; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-bottom: 16px;">📝 Important Information</h3>
              <ul style="line-height: 1.8; color: #2e7d32;">
                <li>Please arrive at the hotel on your check-in date</li>
                <li>Bring a valid ID proof for verification</li>
                <li>Check-in time is typically 2:00 PM onwards</li>
                <li>Check-out time is typically 11:00 AM</li>
                <li>Contact the hotel directly for any special requests</li>
              </ul>
            </div>

            <div style="background: #fff3cd; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-bottom: 16px;">⚠️ Cancellation Policy</h3>
              <p style="color: #856404; margin-bottom: 8px;">Please review our cancellation policy:</p>
              <ul style="line-height: 1.8; color: #856404;">
                <li>Free cancellation up to 24 hours before check-in</li>
                <li>50% refund for cancellations within 24 hours</li>
                <li>No refund for no-shows</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #333; margin-bottom: 16px;">📞 Contact Information</h3>
              <p style="margin: 8px 0;"><strong>Hotel Phone:</strong> +91-7303006170</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> info@abharamretreats.com</p>
              <p style="margin: 8px 0;"><strong>Address:</strong> Abharam Retreats Lal Kuan Near NH-24 Lal Kuan Ghaziabad </p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            <div style="font-size: 14px; color: #555; text-align: center;">
              <p style="margin: 0 0 8px 0;">Thank you for choosing our hotel!</p>
              <p style="margin: 0 0 4px 0;">📧 info@abharamretreats.com</p>
              <p style="margin: 0;">🌐 <a href="#" style="color: #1a73e8; text-decoration: none;">www.abharamretreats.com</a></p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent successfully to ${guest.email}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    // Don't throw error to avoid breaking the booking process
    // Just log it for debugging
  }
};

export const sendCheckInReminderEmail = async (booking, guest) => {
  try {
    const isMultiRoom = booking.rooms && booking.rooms.length > 0;
    const roomNumbers = isMultiRoom
      ? booking.rooms.map(r => r.room?.roomNumber || 'N/A').join(', ')
      : booking.room?.roomNumber || 'N/A';

    const checkInDate = isMultiRoom
      ? booking.rooms.map(r => new Date(r.checkInDate)).sort((a,b)=>a-b)[0]
      : new Date(booking.checkInDate);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guest.email,
      subject: `Reminder: Your Check-in is Tomorrow - Room ${roomNumbers}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f7f7f7; padding: 32px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #1a73e8;">⏰ Check-in Reminder</h2>
              <p style="color: #666;">We're excited to welcome you tomorrow</p>
            </div>
            <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
            <p>This is a friendly reminder for your stay at our hotel.</p>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #1a73e8; margin: 16px 0;">
              <p style="margin: 6px 0;"><strong>Check-in Date:</strong> ${checkInDate.toLocaleDateString()}</p>
              <p style="margin: 6px 0;"><strong>Room Number(s):</strong> ${roomNumbers}</p>
              <p style="margin: 6px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
            </div>
            <p style="margin: 0 0 8px 0;"><strong>Tips for a smooth check-in:</strong></p>
            <ul style="margin-top: 0; line-height: 1.8;">
              <li>Please carry a valid government ID</li>
              <li>Standard check-in time is 2:00 PM onwards</li>
              <li>For any special requests, reply to this email</li>
            </ul>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
              <p style="margin: 6px 0;"><strong>Hotel Phone:</strong> +91-7303006170</p>
              <p style="margin: 6px 0;"><strong>Email:</strong> info@abharamretreats.com</p>
              <p style="margin: 6px 0;"><strong>Address:</strong>Abharam Retreats Lal Kuan Near NH-24 Lal Kuan Ghaziabad</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Check-in reminder email sent to ${guest.email}`);
  } catch (error) {
    console.error('Error sending check-in reminder email:', error);
  }
};

export const sendFeedbackRequestEmail = async (booking, guest, linkUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guest.email,
      subject: `We value your feedback for your recent stay (${booking._id})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f7f7f7; padding: 32px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
            <h2 style="margin-top: 0; color: #1a73e8;">🙏 Tell us how we did</h2>
            <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
            <p>Thanks for staying with us. Your feedback helps us improve. It only takes a minute.</p>
            <div style="margin: 20px 0;">
              <a href="${linkUrl}" style="display:inline-block; background:#1a73e8; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none;">Leave feedback</a>
            </div>
            <p style="color:#666; font-size:13px;">If the button doesn't work, copy and paste this link in your browser:<br/>${linkUrl}</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Feedback request email sent to ${guest.email}`);
  } catch (error) {
    console.error('Error sending feedback request email:', error);
  }
};

export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f7f7f7; padding: 32px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1a73e8; margin-bottom: 8px;">🔐 Verification Code</h1>
              <p style="color: #666; font-size: 16px;">Your login verification code</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${userName || email}</strong>,</p>
            <p style="font-size: 15px; margin-bottom: 24px;">You have requested to log in to your account. Please use the following verification code:</p>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #1a73e8; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #1a73e8; letter-spacing: 8px; margin: 16px 0;">
                ${otp}
              </div>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            <div style="font-size: 14px; color: #555; text-align: center;">
              <p style="margin: 0;">This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};