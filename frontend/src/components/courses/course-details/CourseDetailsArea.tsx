import { useState } from "react";
import { useParams } from "react-router-dom";
import TeachersSelection from "./TeachersSelection";
import Curriculum from "./Curriculum";

const CourseDetailsArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<"teachers" | "curriculum">("teachers");

  return (
    <section className="courses__details-area">
      <div className="container" style={{ maxWidth: "1400px", paddingTop: "20px" }}>
        {/* Navigation Tabs */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-3 border-bottom">
          <ul className="nav nav-pills gap-2" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 fw-semibold border-0 ${
                  activeTab === "teachers" ? "active bg-primary text-white" : "text-muted bg-light"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                <i className="fas fa-chalkboard-teacher me-2"></i>
                Find Teachers & Book
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 fw-semibold border-0 ${
                  activeTab === "curriculum" ? "active bg-primary text-white" : "text-muted bg-light"
                }`}
                onClick={() => setActiveTab("curriculum")}
              >
                <i className="fas fa-book-open me-2"></i>
                Curriculum & Live Classes
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "curriculum" ? (
          <div className="p-4 bg-white rounded-4 shadow-sm mb-5">
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
