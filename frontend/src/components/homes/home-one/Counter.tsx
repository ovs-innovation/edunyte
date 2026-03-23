import Count from "../../common/Count";
import { useTranslation } from "react-i18next";

interface DataType {
   id: number;
   count: number;
   count_text: string;
   text: string;
};

const Counter = () => {
   const { t } = useTranslation();

   const count_data: DataType[] = [
      {
         id: 1,
         count: 45,
         count_text: "K+",
         text: t('home.counter.active_students'),
      },
      {
         id: 2,
         count: 100,
         count_text: "K+",
         text: t('home.counter.experienced_tutors'),
      },
      {
         id: 3,
         count: 156,
         count_text: "K+",
         text: t('home.counter.courses'),
      },
      {
         id: 4,
         count: 120,
         count_text: "K+",
         text: t('home.counter.tutor_nationalities'),
      },
   ];

   return (
      <section className="fact__area">
         <div className="container">
            <div className="fact__inner-wrap mt-10">
               <div className="row">
                  {count_data.map((item) => (
                     <div key={item.id} className="col-lg-3 col-6">
                        <div className="fact__item">
                           <h2 className="count"><Count number={item.count} />{item.count_text}</h2>
                           <p>{item.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Counter
