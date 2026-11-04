import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import BtnArrow from '../svg/BtnArrow';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = ({ role }: { role?: string }) => {
   const { t } = useTranslation();
   const { login } = useAuth();
   const [isLoading, setIsLoading] = useState(false);
   const [loginError, setLoginError] = useState<string | null>(null);

   const schema = yup
      .object({
         email: yup.string().required().email().label(t("common.email")),
         password: yup.string().required().label(t("common.password")),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const onSubmit = async (data: FormData) => {
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

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="account__form">
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
   )
}

export default LoginForm
