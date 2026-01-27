import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchCourses, type Course } from "../../../services/courseService";
import { fetchCategories, type Category } from "../../../services/categoryService";

const setting = {
  slidesPerView: 4,
  loop: true,
  spaceBetween: 30,
  observer: true,
  observeParents: true,
  autoplay: false,
  navigation: {
    nextEl: '.courses-button-next',
    prevEl: '.courses-button-prev',
  },
  breakpoints: {
    '1500': {
      slidesPerView: 4,
    },
    '1200': {
      slidesPerView: 4,
    },
    '992': {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    '768': {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    '576': {
      slidesPerView: 1,
    },
    '0': {
      slidesPerView: 1,
    },
  },
};

interface CourseProps {
  style: boolean;
}

const CourseArea = ({ style }: CourseProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories('active');
        setCategories(response.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const params: { status: string; limit?: number; category?: string } = { 
          status: 'active',
          limit: 12
        };
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        const response = await fetchCourses(params);
        setCourses(response.courses);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [selectedCategory]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (index === 0) {
      setSelectedCategory(null);
    } else if (categories[index - 1]) {
      setSelectedCategory(categories[index - 1]._id);
    }
  };

  const tabTitles = [t('common.all_courses'), ...categories.map(cat => cat.name)];

  if (loading) {
    return (
      <section className={`courses-area ${style ? "section-py-120" : "section-pt-120 section-pb-90"}`} style={{ backgroundImage: `url(/assets/img/bg/courses_bg.jpg )` }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <p>{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`courses-area ${style ? "section-py-120" : "section-pt-120 section-pb-90"}`} style={{ backgroundImage: `url(/assets/img/bg/courses_bg.jpg )` }}>
      <div className="container">
        <div className="section__title-wrap">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section__title text-center mb-40">
                <span className="sub-title">{t('common.top_class_courses')}</span>
                <h2 className="title">{t('common.best_exciting_class_experience')}</h2>
                <p className="desc">{t('common.category_description')}</p>
              </div>
              <div className="courses__nav">
                <ul className="nav nav-tabs" id="courseTab" role="tablist">
                  {tabTitles.map((tab, index) => (
                    <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                      <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="tab-content" id="courseTabContent">
          <div className={`tab-pane fade ${activeTab === activeTab ? 'show active' : ''}`} id="all-tab-pane" role="tabpanel" aria-labelledby="all-tab">
            {courses.length === 0 ? (
              <div className="row justify-content-center">
                <div className="col-12 text-center">
                  <p>{t('common.no_courses_found')}</p>
                </div>
              </div>
            ) : (
              <Swiper {...setting} modules={[Autoplay, Navigation]} className="swiper courses-swiper-active">
                {courses.map((item) => (
                  <SwiperSlide key={item._id} className="swiper-slide">
                    <div className="courses__item shine__animate-item">
                      <div className="courses__item-thumb">
                        <Link to={`/course/${item.slug || item._id}`} className="shine__animate-link">
                          <img src={item.image || '/assets/img/courses/course_default.jpg'} alt={item.name} />
                        </Link>
                      </div>
                      <div className="courses__item-content">
                        <ul className="courses__item-meta list-wrap">
                          <li className="courses__item-tag">
                            <Link to={`/courses?category=${selectedCategory || ''}`}>{item.category || t('common.categories')}</Link>
                          </li>
                          <li className="avg-rating"><i className="fas fa-star"></i> (5.0 {t('common.reviews')})</li>
                        </ul>
                        <h5 className="title"><Link to={`/course/${item.slug || item._id}`}>{item.name}</Link></h5>
                        {item.description && <p className="info">{item.description}</p>}
                        <div className="courses__item-bottom">
                          <div className="button">
                            <Link to={`/course/${item.slug || item._id}`}>
                              <span className="text">{t('common.book_session')}</span>
                              <i className="flaticon-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            {!style && (
              <div className="courses__nav">
                <div className="courses-button-prev"><i className="flaticon-arrow-right"></i></div>
                <div className="courses-button-next"><i className="flaticon-arrow-right"></i></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CourseArea
