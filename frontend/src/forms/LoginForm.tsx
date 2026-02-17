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
         <div className="form-grp">
            <label htmlFor="email">{t("common.email")}</label>
            <input id="email" {...register("email")} type="email" placeholder={t("common.email")} />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-grp">
            <label htmlFor="password">{t("common.password")}</label>
            <input id="password" {...register("password")} type="password" placeholder={t("common.password")} />
            <p className="form_error">{errors.password?.message}</p>
         </div>
         <div className="account__check">
            <div className="account__check-remember">
               <input type="checkbox" className="form-check-input" value="" id="terms-check" />
               <label htmlFor="terms-check" className="form-check-label">{t("common.remember_me")}</label>
            </div>
            <div className="account__check-forgot">
               <Link to="/registration">{t("common.forgot_password")}</Link>
            </div>
         </div>
         <button type="submit" className="btn btn-two arrow-btn" disabled={isLoading}>
            {isLoading ? t('common.signing_in') : t("common.sign_in")}
            <BtnArrow />
         </button>
      </form>
   )
}

export default LoginForm
