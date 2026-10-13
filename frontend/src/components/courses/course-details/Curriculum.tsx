import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseLectures, type Lecture } from "../../../services/courseService";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

interface CurriculumProps {
  slug?: string;
}

const Curriculum: React.FC<CurriculumProps> = ({ slug: propSlug }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = propSlug || routeSlug;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLecture(null);
      }
    };

    if (activeLecture) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activeLecture]);

  useEffect(() => {
    if (!slug) return;
    const loadLectures = async () => {
      try {
        setLoading(true);
        const data = await fetchCourseLectures(slug);
        setLectures(data.lectures || []);

        // Default open the first section
        const grouped: Record<string, boolean> = {};
        (data.lectures || []).forEach((lec, idx) => {
          const sec = lec.section || "General";
          if (grouped[sec] === undefined) {
            grouped[sec] = idx === 0;
          }
        });
        setOpenSections(grouped);
      } catch (err: any) {
        console.error("Failed to load curriculum lectures:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLectures();
  }, [slug]);

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleCopyMeet = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Google Meet link copied to clipboard!");
  };

  const handleWatchLecture = (item: Lecture) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to watch this lecture");
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setActiveLecture(item);
  };

  const handleJoinMeet = (url: string) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to join live sessions");
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    window.open(url, "_blank");
  };

  // Group lectures by section
  const sectionsMap = new Map<string, Lecture[]>();
  lectures.forEach((lec) => {
    const sec = lec.section || "General";
    if (!sectionsMap.has(sec)) {
      sectionsMap.set(sec, []);
    }
    sectionsMap.get(sec)!.push(lec);
  });

  const getLectureTitle = (lec: Lecture): string => {
    if (!lec.title) return "Untitled Lecture";
    if (typeof lec.title === "string") return lec.title;
    return (lec.title as any).en || Object.values(lec.title)[0] || "Untitled Lecture";
  };

  return (
    <div className="courses__curriculum-wrap my-2 my-md-4">
      <style>{`
        .curriculum-lecture-item {
          display: grid;
          grid-template-columns: 44px 1fr auto;
          grid-template-areas: "icon info actions";
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background-color: #ffffff;
          border-bottom: 1px solid #edf2f7;
          transition: all 0.2s ease;
        }

        .curriculum-lecture-item.is-live {
          background-color: rgba(40, 167, 69, 0.03);
        }

        .curriculum-lecture-item.has-video:hover {
          background-color: #f8fafc;
        }

        .curriculum-lecture-item .lecture-icon-area {
          grid-area: icon;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .curriculum-lecture-item .lecture-info-area {
          grid-area: info;
          min-width: 0;
        }

        .curriculum-lecture-item .lecture-actions-area {
          grid-area: actions;
        }

        @media (max-width: 767px) {
          .curriculum-lecture-item {
            grid-template-columns: 44px 1fr;
            grid-template-areas:
              "icon info"
              "actions actions";
            gap: 12px 14px;
            padding: 14px 14px;
          }

          .curriculum-lecture-item .lecture-actions-area {
            width: 100%;
            padding-top: 4px;
          }

          .curriculum-lecture-item .actions-grid-recorded {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }

          .curriculum-lecture-item .actions-grid-recorded button {
            min-height: 42px;
            font-size: 13.5px;
            font-weight: 600;
            width: 100%;
            justify-content: center;
          }

          .curriculum-lecture-item .actions-grid-live {
            display: grid;
            grid-template-columns: 44px 1fr;
            gap: 8px;
            width: 100%;
          }

          .curriculum-lecture-item .actions-grid-live button {
            min-height: 42px;
            font-size: 13.5px;
            font-weight: 600;
          }
        }

        @media (min-width: 768px) {
          .curriculum-lecture-item .actions-grid-recorded,
          .curriculum-lecture-item .actions-grid-live {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        .cinema-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(5, 10, 24, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          box-sizing: border-box;
        }

        .cinema-modal-container {
          width: 100%;
          max-width: 1060px;
          background: linear-gradient(180deg, #121a2f 0%, #0a0f1d 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 50px rgba(13, 110, 253, 0.18);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .cinema-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .cinema-modal-footer {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 576px) {
          .cinema-modal-overlay {
            padding: 8px !important;
          }
          .cinema-modal-container {
            border-radius: 14px !important;
          }
          .cinema-modal-header {
            padding: 10px 12px !important;
          }
          .cinema-modal-header h5 {
            font-size: 14px !important;
          }
          .cinema-modal-footer {
            padding: 10px 12px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Header section with responsive flex */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="title mb-1" style={{ fontSize: "21px", fontWeight: "700" }}>
            Course Curriculum & Live Classes
          </h3>
          <p className="text-muted mb-0 small">
            Access recorded lessons and live scheduled interactive sessions.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill small">
            {lectures.filter((l) => l.type === "recorded").length} Recorded Lessons
          </span>
          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill small">
            {lectures.filter((l) => l.type === "live").length} Live Classes
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading curriculum...</span>
          </div>
          <p className="mt-2 text-muted small">Loading course curriculum...</p>
        </div>
      ) : lectures.length === 0 ? (
        <div className="card border-0 shadow-sm p-4 p-md-5 text-center bg-light rounded-4">
          <div className="mb-3 text-muted">
            <i className="flaticon-book" style={{ fontSize: "40px" }}></i>
          </div>
          <h5 className="fw-bold">No lectures uploaded yet</h5>
          <p className="text-muted small max-w-sm mx-auto mb-0">
            The curriculum and live class schedule for this course will be published shortly by our instructors.
          </p>
        </div>
      ) : (
        <div className="accordion" id="curriculumAccordion">
          {Array.from(sectionsMap.entries()).map(([sectionName, sectionLectures], sIdx) => {
            const isOpen = !!openSections[sectionName];

            return (
              <div key={sectionName} className="accordion-item mb-3 border rounded-3 overflow-hidden shadow-sm">
                <h2 className="accordion-header" id={`secHeading-${sIdx}`}>
                  <button
                    className={`accordion-button ${isOpen ? "" : "collapsed"} bg-light text-dark fw-bold`}
                    type="button"
                    onClick={() => toggleSection(sectionName)}
                    style={{ fontSize: "15px", padding: "14px 16px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center w-100 me-2 me-sm-3 flex-wrap gap-2">
                      <span>{sectionName}</span>
                      <span className="badge bg-secondary bg-opacity-25 text-dark fw-normal rounded-pill px-2.5 py-1 small">
                        {sectionLectures.length} item{sectionLectures.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                </h2>

                <div className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
                  <div className="accordion-body p-0">
                    <ul className="list-group list-group-flush p-0 m-0">
                      {sectionLectures.map((item) => {
                        const isRecorded = item.type === "recorded";
                        const isLive = item.type === "live";
                        const title = getLectureTitle(item);
                        const hasVideo = isRecorded && !!item.videoUrl;

                        return (
                          <li
                            key={item._id}
                            className={`curriculum-lecture-item ${isLive ? "is-live" : ""} ${hasVideo ? "has-video" : ""}`}
                            style={{
                              cursor: hasVideo ? "pointer" : "default",
                            }}
                            onClick={() => {
                              if (hasVideo) {
                                handleWatchLecture(item);
                              }
                            }}
                          >
                            {/* Grid Area: Icon */}
                            <div className="lecture-icon-area">
                              {hasVideo ? (
                                <button
                                  type="button"
                                  className="btn p-0 border-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                    backgroundColor: "#0d6efd",
                                    color: "#ffffff",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWatchLecture(item);
                                  }}
                                  title="Play Lecture Video"
                                >
                                  <i className="fas fa-play" style={{ fontSize: "12px", marginLeft: "2px" }}></i>
                                </button>
                              ) : (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                    backgroundColor: isLive ? "rgba(40, 167, 69, 0.12)" : "rgba(13, 110, 253, 0.1)",
                                    color: isLive ? "#28a745" : "#0d6efd",
                                  }}
                                >
                                  {isLive ? (
                                    <i className="fas fa-video" style={{ fontSize: "15px" }}></i>
                                  ) : (
                                    <i className="fas fa-play" style={{ fontSize: "12px" }}></i>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Grid Area: Info */}
                            <div className="lecture-info-area">
                              <div className="d-flex flex-wrap align-items-center gap-1.5 mb-1">
                                <span
                                  className="fw-semibold text-dark me-1"
                                  style={{ fontSize: "15px", lineHeight: "1.3" }}
                                >
                                  {title}
                                </span>
                                {isRecorded && (
                                  <span className="badge bg-primary bg-opacity-10 text-primary border-0 small px-2 py-0.5">
                                    Recorded
                                  </span>
                                )}
                                {isLive && (
                                  <span className="badge bg-success bg-opacity-10 text-success border-0 small px-2 py-0.5">
                                    Live Class
                                  </span>
                                )}
                                {item.isPreview && (
                                  <span className="badge bg-warning bg-opacity-15 text-warning border-0 small px-2 py-0.5">
                                    Free Preview
                                  </span>
                                )}
                              </div>

                              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mt-1">
                                {isRecorded && item.videoDuration ? (
                                  <span>
                                    <i className="far fa-clock me-1"></i>
                                    {item.videoDuration} min
                                  </span>
                                ) : null}

                                {isLive && item.liveMeeting?.scheduledAt && (
                                  <span className="text-success fw-medium">
                                    <i className="far fa-calendar-alt me-1"></i>
                                    {new Date(item.liveMeeting.scheduledAt).toLocaleString()}
                                  </span>
                                )}

                                {isLive && item.liveMeeting?.duration ? (
                                  <span>
                                    <i className="far fa-clock me-1"></i>
                                    {item.liveMeeting.duration} min
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Grid Area: Actions (structured grid on mobile, flex on desktop) */}
                            <div className="lecture-actions-area">
                              {hasVideo && (
                                <div className="actions-grid-recorded">
                                  <button
                                    type="button"
                                    className={`btn rounded-pill px-3.5 py-2 shadow-sm d-flex align-items-center gap-2 fw-semibold ${
                                      item.isPreview ? "btn-outline-primary" : "btn-primary text-white"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWatchLecture(item);
                                    }}
                                  >
                                    <i className="fas fa-play" style={{ fontSize: "11px" }}></i>
                                    <span>{item.isPreview ? "Watch Preview" : "Watch Lecture"}</span>
                                  </button>
                                </div>
                              )}

                              {isLive && item.liveMeeting?.meetingUrl && (
                                <div className="actions-grid-live">
                                  <button
                                    type="button"
                                    className="btn btn-outline-success rounded-pill px-3 py-2 d-flex align-items-center justify-content-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyMeet(item.liveMeeting!.meetingUrl);
                                    }}
                                    title="Copy Google Meet Link"
                                  >
                                    <i className="far fa-copy"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-success rounded-pill px-3.5 py-2 text-white shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJoinMeet(item.liveMeeting!.meetingUrl);
                                    }}
                                  >
                                    <i className="fas fa-external-link-alt"></i>
                                    <span>Join Meet</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Cinema Video Player Modal Portaled to Body */}
      {typeof document !== "undefined" &&
        activeLecture &&
        activeLecture.videoUrl &&
        createPortal(
          <div
            className="cinema-modal-overlay"
            onClick={() => setActiveLecture(null)}
          >
            <div
              className="cinema-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="cinema-modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                  <span
                    style={{
                      background: activeLecture.isPreview
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "linear-gradient(135deg, #0d6efd 0%, #0099ff 100%)",
                      color: "#ffffff",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      padding: "3px 9px",
                      borderRadius: "100px",
                    }}
                  >
                    {activeLecture.isPreview ? "Free Preview" : "Recorded"}
                  </span>

                  <h5
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 700,
                      letterSpacing: "-0.2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "280px",
                    }}
                  >
                    {getLectureTitle(activeLecture)}
                  </h5>

                  {activeLecture.videoDuration ? (
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        padding: "2px 7px",
                        borderRadius: "6px",
                      }}
                    >
                      <i className="far fa-clock" style={{ fontSize: "10px" }}></i>
                      {activeLecture.videoDuration} min
                    </span>
                  ) : null}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveLecture(null)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                  title="Close (Esc)"
                  aria-label="Close video player"
                >
                  <i className="fas fa-times" style={{ fontSize: "14px" }}></i>
                </button>
              </div>

              {/* Video Player Display */}
              <div
                style={{
                  background: "#000000",
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: "75vh",
                  overflow: "hidden",
                }}
              >
                {activeLecture.videoUrl.includes("youtube.com") ||
                activeLecture.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={
                      activeLecture.videoUrl.includes("watch?v=")
                        ? activeLecture.videoUrl.replace("watch?v=", "embed/")
                        : activeLecture.videoUrl
                    }
                    title={getLectureTitle(activeLecture)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                    }}
                  />
                ) : (
                  <video
                    src={activeLecture.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      outline: "none",
                      display: "block",
                    }}
                  >
                    Your browser does not support HTML5 video.
                  </video>
                )}
              </div>

              {/* Modal Footer & Tips */}
              <div className="cinema-modal-footer">
                <div style={{ flex: 1, minWidth: "180px" }}>
                  {activeLecture.description ? (
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "12.5px",
                        lineHeight: 1.4,
                      }}
                    >
                      {typeof activeLecture.description === "string"
                        ? activeLecture.description
                        : (activeLecture.description as any)?.en || ""}
                    </p>
                  ) : (
                    <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "11.5px" }}>
                      High Definition Lecture Video (Hosted on Cloudinary)
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "11px",
                  }}
                >
                  <i className="fas fa-keyboard" style={{ fontSize: "10px" }}></i>
                  <span>Press Esc to close</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Curriculum;
