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

const LoginForm = () => {
   const { t } = useTranslation();
   const { login } = useAuth();
   const [isLoading, setIsLoading] = useState(false);

   const schema = yup
      .object({
         email: yup.string().required().email().label(t("common.email")),
         password: yup.string().required().label(t("common.password")),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const onSubmit = async (data: FormData) => {
      setIsLoading(true);
      try {
         await login(data);
         toast.success(t("common.login_success"), { position: 'top-center' });
         reset();
      } catch (error: any) {
         const errorMessage = error.message === 'OTP_REQUIRED'
            ? t('common.otp_sent')
            : error.message || t('common.login_failed');
         toast.error(errorMessage, { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="account__form">
         <div className="form-grp mb-25">
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
         <div className="form-grp mb-25">
            <label htmlFor="password">{t("common.password")}</label>
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
         <div className="account__check d-flex justify-content-between align-items-center mb-30">
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
