import { Link } from "react-router-dom"
import EventDetailsSidebar from "./EventDetailsSidebar"
import { useTranslation } from "react-i18next";

const EventDetailsArea = () => {
  const { t } = useTranslation();
  return (
    <section className="event__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="event__details-thumb">
              <img src="/assets/img/events/event_details_img.jpg" alt="img" />
            </div>
            <div className="event__details-content-wrap">
              <div className="row">
                <div className="col-70">
                  <div className="event__details-content">
                    <div className="event__details-content-top">
                      <Link to="/courses" className="tag">{t('events.details.tag')}</Link>
                      <span className="avg-rating"><i className="fas fa-star"></i>{t('events.details.reviews', { count: 4.8 })}</span>
                    </div>
                    <h2 className="title">{t('events.details.title')}</h2>
                    <div className="event__meta">
                      <ul className="list-wrap">
                        <li className="author">
                          <img src="/assets/img/courses/course_author001.png" alt="img" />
                          {t('events.details.by')}
                          <Link to="/instructor-details">{t('events.details.author')}</Link>
                        </li>
                        <li className="location"><i className="flaticon-placeholder"></i>{t('events.details.location')}</li>
                        <li><i className="flaticon-mortarboard"></i>{t('events.details.students')}</li>
                      </ul>
                    </div>
                    <div className="event__details-overview">
                      <h4 className="title-two">{t('events.details.overview_title')}</h4>
                      <p>{t('events.details.overview_desc')}</p>
                    </div>
                    <h4 className="title-two">{t('events.details.learn_title')}</h4>
                    <p>{t('events.details.learn_desc')}</p>

                    <div className="event__details-inner">
                      <div className="row">
                        <div className="col-39">
                          <img src="/assets/img/events/event_details_img02.jpg" alt="img" />
                        </div>
                        <div className="col-61">
                          <div className="event__details-inner-content">
                            <h4 className="title">{t('events.details.elements_title')}</h4>
                            <ul className="about__info-list list-wrap">
                              <li className="about__info-list-item">
                                <i className="flaticon-angle-right"></i>
                                <p className="content">{t('events.details.elements.1')}</p>
                              </li>
                              <li className="about__info-list-item">
                                <i className="flaticon-angle-right"></i>
                                <p className="content">{t('events.details.elements.2')}</p>
                              </li>
                              <li className="about__info-list-item">
                                <i className="flaticon-angle-right"></i>
                                <p className="content">{t('events.details.elements.3')}</p>
                              </li>
                              <li className="about__info-list-item">
                                <i className="flaticon-angle-right"></i>
                                <p className="content">{t('events.details.elements.4')}</p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p>{t('events.details.bottom_desc')}</p>
                  </div>
                </div>
                <div className="col-30">
                  <EventDetailsSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventDetailsArea
