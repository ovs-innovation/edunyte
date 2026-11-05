import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendLoginOTP } from '../services/authService';
import { useState, useEffect } from 'react';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = ({ role }: { role?: string }) => {
   const { t } = useTranslation();
   const { login, loginWithOTP } = useAuth();
   
   // Login Mode: 'password' | 'otp'
   const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
   const [isLoading, setIsLoading] = useState(false);
   const [loginError, setLoginError] = useState<string | null>(null);

   // OTP Login State
   const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
   const [otpEmail, setOtpEmail] = useState('');
   const [otpCode, setOtpCode] = useState('');
   const [resendTimer, setResendTimer] = useState(0);

   // Countdown timer for OTP resend
   useEffect(() => {
      if (resendTimer > 0) {
         const interval = setInterval(() => {
            setResendTimer(prev => prev - 1);
         }, 1000);
         return () => clearInterval(interval);
      }
   }, [resendTimer]);

   // Password Form
   const schema = yup
      .object({
         email: yup.string().required().email().label(t("common.email")),
         password: yup.string().required().label(t("common.password")),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const onSubmitPassword = async (data: FormData) => {
      setIsLoading(true);
      setLoginError(null);
      try {
         await login(data, role);
         toast.success(t("common.login_success"), { position: 'top-center' });
         reset();
      } catch (error: any) {
         const errorMessage = error.message === 'OTP_REQUIRED'
            ? t('common.otp_sent')
            : error.message || t('common.login_failed');
         setLoginError(errorMessage);
         toast.error(errorMessage, { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   // Send Login OTP
   const handleSendOtp = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const emailToUse = otpEmail.trim().toLowerCase();
      
      if (!emailToUse) {
         setLoginError("Please enter your email address");
         return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToUse)) {
         setLoginError("Please enter a valid email address");
         return;
      }

      setIsLoading(true);
      setLoginError(null);

      try {
         const appType = role === 'instructor' ? 'instructor' : 'student';
         const res = await sendLoginOTP(emailToUse, appType);
         setOtpStep('code');
         setResendTimer(60);
         toast.success(res.message || t("common.otp_sent"), { position: 'top-center' });
      } catch (error: any) {
         const errorMessage = error.message || "Failed to send verification code";
         setLoginError(errorMessage);
         toast.error(errorMessage, { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   // Verify Login OTP
   const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otpCode.trim();

      if (!code || code.length !== 6) {
         setLoginError("Please enter a valid 6-digit verification code");
         return;
      }

      setIsLoading(true);
      setLoginError(null);

      try {
         await loginWithOTP(otpEmail.trim().toLowerCase(), code, role);
         toast.success(t("common.login_success"), { position: 'top-center' });
      } catch (error: any) {
         const errorMessage = error.message || "Invalid or expired verification code";
         setLoginError(errorMessage);
         toast.error(errorMessage, { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="account__form">
         {/* Mode Switcher Tabs */}
         <div 
            className="d-flex align-items-center justify-content-center p-1 rounded-3 mb-4" 
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
         >
            <button
               type="button"
               className={`btn btn-sm flex-fill fw-bold py-2 rounded-2 transition-all border-0 shadow-none d-flex align-items-center justify-content-center gap-2 ${loginMode === 'password' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
               onClick={() => { 
                  setLoginMode('password'); 
                  setLoginError(null); 
               }}
               style={{ fontSize: '0.85rem' }}
            >
               <i className="fas fa-lock" style={{ fontSize: '0.8rem' }}></i>
               <span>{t("common.login_with_password", "Password")}</span>
            </button>
            <button
               type="button"
               className={`btn btn-sm flex-fill fw-bold py-2 rounded-2 transition-all border-0 shadow-none d-flex align-items-center justify-content-center gap-2 ${loginMode === 'otp' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
               onClick={() => { 
                  setLoginMode('otp'); 
                  setLoginError(null); 
               }}
               style={{ fontSize: '0.85rem' }}
            >
               <i className="fas fa-envelope-open-text" style={{ fontSize: '0.8rem' }}></i>
               <span>{t("common.login_with_otp", "Email OTP")}</span>
            </button>
         </div>

         {/* Alert Box for Errors */}
         {loginError && (
            <div
               className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-3 border-0 shadow-sm"
               role="alert"
               style={{
                  borderRadius: '12px',
                  background: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  color: '#991b1b',
                  fontSize: '0.9rem'
               }}
            >
               <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-exclamation-circle flex-shrink-0 text-danger" style={{ fontSize: '1.1rem' }}></i>
                  <span className="fw-medium">{loginError}</span>
               </div>
               <button
                  type="button"
                  className="btn-close shadow-none"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setLoginError(null)}
                  aria-label="Close"
               ></button>
            </div>
         )}

         {/* PASSWORD LOGIN FORM */}
         {loginMode === 'password' && (
            <form onSubmit={handleSubmit(onSubmitPassword)}>
               <div className="form-grp mb-15">
                  <label htmlFor="email" className="fw-bold small opacity-50 mb-2">{t("common.email")}</label>
                  <div className="position-relative">
                      <input 
                          id="email" 
                          {...register("email")} 
                          type="email" 
                          placeholder="name@example.com"
                          style={{ 
                              width: '100%', 
                              padding: '14px 20px', 
                              background: 'rgba(255,255,255,0.8)', 
                              border: '1px solid var(--glass-border)', 
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                              transition: 'all 0.3s'
                          }} 
                      />
                  </div>
                  <p className="form_error text-danger small mt-1">{errors.email?.message}</p>
               </div>
               <div className="form-grp mb-15">
                  <label htmlFor="password" className="fw-bold small opacity-50 mb-2">{t("common.password")}</label>
                  <input 
                      id="password" 
                      {...register("password")} 
                      type="password" 
                      placeholder="••••••••" 
                      style={{ 
                          width: '100%', 
                          padding: '14px 20px', 
                          background: 'rgba(255,255,255,0.8)', 
                          border: '1px solid var(--glass-border)', 
                          borderRadius: '12px',
                          fontSize: '0.95rem'
                      }} 
                  />
                  <p className="form_error text-danger small mt-1">{errors.password?.message}</p>
               </div>
               <div className="account__check d-flex justify-content-between align-items-center mb-20">
                  <div className="account__check-remember d-flex align-items-center gap-2">
                     <input type="checkbox" className="form-check-input mt-0" value="" id="terms-check" style={{ width: '18px', height: '18px' }} />
                     <label htmlFor="terms-check" className="form-check-label small opacity-70 mb-0">{t("common.remember_me")}</label>
                  </div>
                  <div className="account__check-forgot">
                     <Link to="/registration" className="small text-primary fw-bold" style={{ textDecoration: 'none' }}>{t("common.forgot_password")}</Link>
                  </div>
               </div>
               <button type="submit" className="btn-neon-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2" disabled={isLoading} style={{ borderRadius: '12px' }}>
                  {isLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                  ) : (
                      <>
                          {t("common.sign_in")}
                          <i className="fas fa-arrow-right"></i>
                      </>
                  )}
               </button>
            </form>
         )}

         {/* EMAIL OTP LOGIN FORM */}
         {loginMode === 'otp' && (
            <div>
               {otpStep === 'email' ? (
                  <form onSubmit={handleSendOtp}>
                     <div className="form-grp mb-20">
                        <label htmlFor="otp-email" className="fw-bold small opacity-50 mb-2">{t("common.email")}</label>
                        <div className="position-relative">
                           <input 
                              id="otp-email" 
                              type="email" 
                              value={otpEmail}
                              onChange={(e) => setOtpEmail(e.target.value)}
                              placeholder="name@example.com"
                              required
                              style={{ 
                                 width: '100%', 
                                 padding: '14px 20px', 
                                 background: 'rgba(255,255,255,0.8)', 
                                 border: '1px solid var(--glass-border)', 
                                 borderRadius: '12px',
                                 fontSize: '0.95rem',
                                 transition: 'all 0.3s'
                              }} 
                           />
                        </div>
                        <p className="text-muted small mt-2 mb-0" style={{ fontSize: '0.82rem' }}>
                           <i className="fas fa-info-circle me-1 text-primary"></i>
                           We'll send a 6-digit one-time code to your email to verify your identity.
                        </p>
                     </div>

                     <button 
                        type="submit" 
                        className="btn-neon-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
                        disabled={isLoading || !otpEmail.trim()} 
                        style={{ borderRadius: '12px' }}
                     >
                        {isLoading ? (
                           <>
                              <div className="spinner-border spinner-border-sm" role="status"></div>
                              <span>{t("common.sending_otp", "Sending Code...")}</span>
                           </>
                        ) : (
                           <>
                              <span>{t("common.send_otp", "Send Login Code")}</span>
                              <i className="fas fa-paper-plane"></i>
                           </>
                        )}
                     </button>
                  </form>
               ) : (
                  <form onSubmit={handleVerifyOtp}>
                     <div 
                        className="p-3 mb-3 rounded-3 d-flex align-items-center justify-content-between"
                        style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                     >
                        <div className="small">
                           <div className="text-muted" style={{ fontSize: '0.78rem' }}>Code sent to:</div>
                           <div className="fw-bold text-dark">{otpEmail}</div>
                        </div>
                        <button
                           type="button"
                           className="btn btn-sm btn-link text-primary p-0 fw-bold text-decoration-none small"
                           onClick={() => {
                              setOtpStep('email');
                              setOtpCode('');
                              setLoginError(null);
                           }}
                        >
                           <i className="fas fa-edit me-1"></i> {t("common.change_email", "Change")}
                        </button>
                     </div>

                     <div className="form-grp mb-20">
                        <label htmlFor="otp-code" className="fw-bold small opacity-50 mb-2">
                           {t("common.otp_code", "Verification Code")}
                        </label>
                        <input 
                           id="otp-code" 
                           type="text" 
                           inputMode="numeric"
                           pattern="[0-9]*"
                           maxLength={6}
                           value={otpCode}
                           onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                           placeholder="••••••" 
                           autoFocus
                           required
                           style={{ 
                              width: '100%', 
                              padding: '14px 20px', 
                              background: 'rgba(255,255,255,0.8)', 
                              border: '2px solid #3b82f6', 
                              borderRadius: '12px',
                              fontSize: '1.4rem',
                              letterSpacing: '0.4em',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: '#1e293b',
                              transition: 'all 0.3s'
                           }} 
                        />
                        <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                           <span className="small text-muted" style={{ fontSize: '0.8rem' }}>
                              Enter the 6-digit code
                           </span>
                           {resendTimer > 0 ? (
                              <span className="small text-muted" style={{ fontSize: '0.8rem' }}>
                                 {t("common.resend_in", "Resend in")} {resendTimer}s
                              </span>
                           ) : (
                              <button
                                 type="button"
                                 className="btn btn-sm btn-link p-0 text-primary fw-bold text-decoration-none"
                                 style={{ fontSize: '0.8rem' }}
                                 disabled={isLoading}
                                 onClick={() => handleSendOtp()}
                              >
                                 <i className="fas fa-redo-alt me-1"></i> {t("common.resend_otp", "Resend Code")}
                              </button>
                           )}
                        </div>
                     </div>

                     <button 
                        type="submit" 
                        className="btn-neon-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
                        disabled={isLoading || otpCode.length !== 6} 
                        style={{ borderRadius: '12px' }}
                     >
                        {isLoading ? (
                           <>
                              <div className="spinner-border spinner-border-sm" role="status"></div>
                              <span>{t("common.verifying_otp", "Verifying...")}</span>
                           </>
                        ) : (
                           <>
                              <span>{t("common.verify_and_login", "Verify & Sign In")}</span>
                              <i className="fas fa-arrow-right"></i>
                           </>
                        )}
                     </button>
                  </form>
               )}
            </div>
         )}
      </div>
   );
};

export default LoginForm;
