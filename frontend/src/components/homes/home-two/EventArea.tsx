import { Link } from "react-router-dom";
import BtnArrow from "../../../svg/BtnArrow";
import { useTranslation } from "react-i18next";

interface DataType {
    id: number;
    thumb: string;
    date: string;
    title: string;
    location: string;
};

const EventArea = () => {
    const { t } = useTranslation();

    const event_data: DataType[] = [
        {
            id: 1,
            thumb: "/assets/img/events/event_thumb01.jpg",
            date: "25 June, 2024",
            title: t('events.items_h2.1.title'),
            location: t('events.items_h2.1.location')
        },
        {
            id: 2,
            thumb: "/assets/img/events/event_thumb02.jpg",
            date: "25 June, 2024",
            title: t('events.items_h2.2.title'),
            location: t('events.items_h2.2.location')
        },
        {
            id: 3,
            thumb: "/assets/img/events/event_thumb03.jpg",
            date: "25 June, 2024",
            title: t('events.items_h2.3.title'),
            location: t('events.items_h2.3.location')
        },
    ];

    return (
        <section className="event__area section-pt-120 section-pb-90">
            <div className="container">
                <div className="event__inner-wrap">
                    <div className="row">
                        <div className="col-30">
                            <div className="event__content">
                                <div className="section__title mb-20">
                                    <span className="sub-title">{t('events.home_2_subtitle')}</span>
                                    <h2 className="title">{t('events.home_2_title')}</h2>
                                </div>
                                <p>{t('events.home_2_desc')}</p>
                                <div className="tg-button-wrap">
                                    <Link to="/events" className="btn arrow-btn">{t('events.see_all_events')} <BtnArrow /></Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-70">
                            <div className="event__item-wrap">
                                <div className="row justify-content-center">
                                    {event_data.map((item) => (
                                        <div key={item.id} className="col-lg-4 col-md-6">
                                            <div className="event__item shine__animate-item">
                                                <div className="event__item-thumb">
                                                    <Link to="/events-details" className="shine__animate-link"><img src={item.thumb} alt="img" /></Link>
                                                </div>
                                                <div className="event__item-content">
                                                    <span className="date">{item.date}</span>
                                                    <h2 className="title"><Link to="/events-details">{item.title}</Link></h2>
                                                    <Link to="https://maps.google.com/maps" className="location" target="_blank"><i className="flaticon-map"></i>{item.location}</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="event__shape">
                <img src="/assets/img/events/event_shape.png" alt="img" className="alltuchtopdown" />
            </div>
        </section>
    )
}

export default EventArea;
