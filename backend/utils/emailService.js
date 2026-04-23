import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email Transporter Error:", error.message);
    if (error.message.includes("Invalid login")) {
      console.error("👉 TIP: Your Gmail App Password seems incorrect or expired. Please generate a new one.");
    }
  } else {
    console.log("✅ Email Server is ready to send notifications");
  }
});


export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"Edunyte Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login Verification Code",
      html: `
        <div style="margin:0;padding:32px 0;background:#0b1021;font-family:'Inter',Arial,sans-serif;color:#e2e8f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:560px;width:100%;background:#0e1426;border:1px solid #1f2a44;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.35);">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,#6d28d9,#6366f1,#22d3ee);padding:26px 22px;text-align:center;color:#f8fafc;position:relative;">
                  <div style="margin:0 auto 10px auto;width:54px;height:54px;border-radius:16px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);font-size:26px;">
                    🔑
                  </div>
                  <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.92;">Security Verification</div>
                  <div style="font-size:24px;font-weight:700;margin-top:6px;">Login One-Time Code</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 26px 10px 26px;">
                <p style="margin:0 0 10px 0;font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <span style="font-size:16px;">👤</span>
                  Hello ${userName || email},
                </p>
                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#cbd5e1;">
                  Use this code to continue signing in. It expires in <strong>10 minutes</strong>.
                </p>
                <div style="text-align:center;margin:18px 0 20px 0;">
                  <div style="display:inline-block;padding:16px 22px;border-radius:14px;background:linear-gradient(135deg,#6d28d9,#6366f1,#22d3ee);color:#fff;font-size:30px;letter-spacing:12px;font-weight:800;box-shadow:0 12px 30px rgba(99,102,241,0.45);">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#94a3b8;display:flex;align-items:flex-start;gap:8px;">
                  <span style="font-size:14px;margin-top:2px;">⏳</span>
                  If you didn’t request this, please reset your password and review recent activity.
                </p>
                <p style="margin:0 0 6px 0;font-size:13px;color:#94a3b8;">Stay secure,</p>
                <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:600;">Edunyte Security</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 26px 20px 26px;border-top:1px solid #1f2a44;text-align:center;color:#64748b;font-size:12px;background:#0e1426;">
                This is an automated message; no reply is monitored.
              </td>
            </tr>
          </table>
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

export const sendResetPasswordEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"Edunyte Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="margin:0;padding:32px 0;background:#0b1021;font-family:'Inter',Arial,sans-serif;color:#e2e8f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:560px;width:100%;background:#0e1426;border:1px solid #1f2a44;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.35);">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:26px 22px;text-align:center;color:#f8fafc;">
                  <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.92;">Password Reset</div>
                  <div style="font-size:24px;font-weight:700;margin-top:6px;">Reset Verification Code</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 26px 10px 26px;">
                <p style="margin:0 0 10px 0;font-size:16px;font-weight:600;">Hello ${userName || email},</p>
                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#cbd5e1;">
                  Use this code to reset your password. It expires in <strong>10 minutes</strong>.
                </p>
                <div style="text-align:center;margin:18px 0 20px 0;">
                  <div style="display:inline-block;padding:16px 22px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-size:30px;letter-spacing:12px;font-weight:800;box-shadow:0 12px 30px rgba(99,102,241,0.45);">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                  If you didn't request this, you can ignore this email—your password will remain unchanged.
                </p>
                <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:600;">Edunyte Security</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 26px 20px 26px;border-top:1px solid #1f2a44;text-align:center;color:#64748b;font-size:12px;background:#0e1426;">
                This is an automated message; no reply is monitored.
              </td>
            </tr>
          </table>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Reset password email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
};

export const sendTeacherRegistrationNotificationToAdmin = async (teacherData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"Edunyte System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "New Instructor Registration Pending Approval",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">New Instructor Signup</h2>
          <p>A new instructor has registered and is waiting for your approval.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p><strong>Name:</strong> ${teacherData.name}</p>
            <p><strong>Email:</strong> ${teacherData.email}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="margin-top: 20px;">Please login to the admin panel to review and approve this account.</p>
          <p>Regards,<br/>Edunyte System</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent for new teacher: ${teacherData.email}`);
  } catch (error) {
    console.error("Error sending admin notification email:", error);
  }
};

export const sendInstructorApprovalEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: `"Edunyte Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Instructor Account has been Approved!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">Congratulations!</h2>
          <p>Hello ${userName},</p>
          <p>Your instructor account on Edunyte has been approved by the administrators.</p>
          <p>You can now log in to the platform and start creating your courses or managing your profile.</p>
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/instructor" style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to your Account</a>
          </div>
          <p style="margin-top: 30px;">Welcome to the Edunyte community!</p>
          <p>Regards,<br/>Edunyte Team</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};