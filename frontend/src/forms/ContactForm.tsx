import { toast } from 'react-toastify';
import BtnArrow from '../svg/BtnArrow';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import emailjs from '@emailjs/browser';
import { useTranslation } from "react-i18next";
import { useRef } from 'react';

interface FormData {
   user_name: string;
   user_email: string;
   phone_number?: string;
   role: string;
   message: string;
}

const schema = yup
   .object({
      user_name: yup.string().required().label("Name"),
      user_email: yup.string().required().email().label("Email"),
      phone_number: yup.string().label("Phone Number"),
      role: yup.string().required().label("Role"),
      message: yup.string().required().label("Message"),
   })
   .required();

const ContactForm = () => {
   const { t } = useTranslation();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         emailjs.sendForm('eaglesthemes', 'template_lojvsvb', form.current, 'mtLgOuG25NnIwGeKm')
            .then((result) => {
               const notify = () => toast(t('contact.form.success'), { position: 'top-center' });
               notify();
               reset();
               console.log(result.text);
            }, (error) => {
               console.log(error.text);
            });
      } else {
         console.error("Form reference is null");
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} id="contact-form">
         <div className="row">
            <div className="col-md-6">
               <div className="form-grp">
                  <input {...register("user_name")} type="text" placeholder={t('contact.form.name')} />
                  <p className="form_error">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <input {...register("user_email")} type="email" placeholder={t('contact.form.email')} />
                  <p className="form_error">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <input {...register("phone_number")} type="tel" placeholder={t('contact.form.phone')} />
                  <p className="form_error">{errors.phone_number?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <select {...register("role")} className="form-select" style={{ border: '1px solid #E6E6E6', height: '60px', padding: '0 25px', borderRadius: '10px', color: '#777', backgroundColor: '#F5F5F7' }}>
                     <option value="">{t('contact.form.role_placeholder')}</option>
                     <option value="Student">{t('contact.form.role_student')}</option>
                     <option value="Teacher">{t('contact.form.role_teacher')}</option>
                     <option value="Partner">{t('contact.form.role_partner')}</option>
                  </select>
                  <p className="form_error">{errors.role?.message}</p>
               </div>
            </div>
         </div>
         <div className="form-grp">
            <textarea {...register("message")} placeholder={t('contact.form.message')} style={{ height: '150px' }}></textarea>
            <p className="form_error">{errors.message?.message}</p>
         </div>
         <button type="submit" className="btn btn-two arrow-btn">{t('contact.form.submit')} <BtnArrow /></button>
      </form>
   )
}

export default ContactForm
