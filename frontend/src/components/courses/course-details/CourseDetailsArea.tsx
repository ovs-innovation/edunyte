import { useState } from "react";
import { useParams } from "react-router-dom";
import TeachersSelection from "./TeachersSelection";
import Curriculum from "./Curriculum";

const CourseDetailsArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<"teachers" | "curriculum">("teachers");

  return (
    <section className="courses__details-area">
      <style>{`
        .course-details-nav-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }
        @media (min-width: 576px) {
          .course-details-nav-tabs {
            display: inline-flex;
            width: auto;
            gap: 12px;
          }
        }
        .course-tab-btn {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          font-size: 14px;
          transition: all 0.25s ease;
        }
        @media (max-width: 480px) {
          .course-tab-btn {
            font-size: 12.5px;
            padding: 8px 10px !important;
          }
          .course-tab-btn i {
            margin-right: 6px !important;
          }
        }
      `}</style>
      <div className="container px-2 px-sm-3 px-md-4" style={{ maxWidth: "1400px", paddingTop: "16px" }}>
        {/* Navigation Tabs */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 mb-md-4 pb-3 border-bottom">
          <ul className="nav nav-pills course-details-nav-tabs m-0 p-0" role="tablist">
            <li className="nav-item flex-grow-1 flex-sm-grow-0" role="presentation">
              <button
                className={`nav-link rounded-pill px-3 px-sm-4 py-2 fw-semibold border-0 w-100 course-tab-btn ${
                  activeTab === "teachers"
                    ? "active bg-primary text-white shadow-sm"
                    : "text-muted bg-light"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                <i className="fas fa-chalkboard-teacher me-2"></i>
                <span>Find Teachers & Book</span>
              </button>
            </li>
            <li className="nav-item flex-grow-1 flex-sm-grow-0" role="presentation">
              <button
                className={`nav-link rounded-pill px-3 px-sm-4 py-2 fw-semibold border-0 w-100 course-tab-btn ${
                  activeTab === "curriculum"
                    ? "active bg-primary text-white shadow-sm"
                    : "text-muted bg-light"
                }`}
                onClick={() => setActiveTab("curriculum")}
              >
                <i className="fas fa-book-open me-2"></i>
                <span>Curriculum & Live Classes</span>
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "curriculum" ? (
          <div className="p-3 p-sm-4 bg-white rounded-4 shadow-sm mb-5">
            <Curriculum slug={slug} />
          </div>
        ) : (
          <TeachersSelection />
        )}
      </div>
    </section>
  );
};

export default CourseDetailsArea;
