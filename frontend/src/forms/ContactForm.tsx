import { toast } from 'react-toastify';
import BtnArrow from '../svg/BtnArrow';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import emailjs from '@emailjs/browser';
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

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         emailjs.sendForm('eaglesthemes', 'template_lojvsvb', form.current, 'mtLgOuG25NnIwGeKm')
            .then((result) => {
               const notify = () => toast('Message sent successfully', { position: 'top-center' });
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
                  <input {...register("user_name")} type="text" placeholder="Full Name *" />
                  <p className="form_error">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <input {...register("user_email")} type="email" placeholder="Email Address *" />
                  <p className="form_error">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <input {...register("phone_number")} type="tel" placeholder="Phone Number (Optional)" />
                  <p className="form_error">{errors.phone_number?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <select {...register("role")} className="form-select" style={{ border: '1px solid #E6E6E6', height: '60px', padding: '0 25px', borderRadius: '10px', color: '#777', backgroundColor: '#F5F5F7' }}>
                     <option value="">I am a...</option>
                     <option value="Student">Student</option>
                     <option value="Teacher">Teacher</option>
                     <option value="Partner">Partner</option>
                  </select>
                  <p className="form_error">{errors.role?.message}</p>
               </div>
            </div>
         </div>
         <div className="form-grp">
            <textarea {...register("message")} placeholder="Message *" style={{ height: '150px' }}></textarea>
            <p className="form_error">{errors.message?.message}</p>
         </div>
         <button type="submit" className="btn btn-two arrow-btn">Submit Message <BtnArrow /></button>
      </form>
   )
}

export default ContactForm
