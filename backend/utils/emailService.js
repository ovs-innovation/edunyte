import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === "true" : true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
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