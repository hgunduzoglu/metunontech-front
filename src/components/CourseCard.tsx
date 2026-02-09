import { DAYS } from "../constants";
import type { Availability, Course, Section, TimeItem } from "../types";
import { isSectionCompatibleWithAvailability } from "../utils";
import { Fragment, useEffect, useMemo, useState } from "react";

interface Props {
  course: Course;
  availability: Availability;
}

const renderTime = (t: TimeItem) => {
  if (t.day === "No Timestamp Added Yet") {
    return (
      <div className="schedule-item">
        <span className="day">{t.day}</span>
      </div>
    );
  }
  let dLabel: string | number = t.day;
  if (typeof dLabel === "number" && dLabel >= 0 && dLabel < DAYS.length) {
    dLabel = DAYS[dLabel].label;
  }
  return (
    <div className="schedule-item">
      <span className="day">{dLabel}</span>
      <span className="time">
        {t.start} - {t.end}
      </span>
      <span className="room">{t.room ? `Room: ${t.room}` : ""}</span>
    </div>
  );
};

const renderInstructors = (arr?: string[]) => {
  if (!arr || arr.length === 0) return null;
  const filtered = arr.filter((i) => i !== "STAFF");
  if (filtered.length === 0) return null;
  return (
    <div className="instructors">
      <i className="fas fa-user-tie instructor-icon" />
      <span className="instructor-names">{filtered.join(" • ")}</span>
    </div>
  );
};

export default function CourseCard({ course, availability }: Props) {
  const relevantSections: Section[] =
    Object.keys(availability).length === 0
      ? course.sections
      : course.sections.filter((sec) => isSectionCompatibleWithAvailability(sec, availability));

  const sectionKeys = useMemo(
    () => relevantSections.map((section, idx) => `${section.section_id}-${idx}`),
    [relevantSections]
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections((prev) => {
      const next: Record<string, boolean> = {};
      sectionKeys.forEach((key) => {
        if (prev[key]) next[key] = true;
      });
      return next;
    });
  }, [sectionKeys]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="course-card">
      <h2>{course.code.departmental}</h2>
      <p className="course-code-numeric">Code: {course.code.numeric}</p>
      <p className="course-name">{course.name}</p>
      <p className="credits">Credits: {course.credits}</p>

      <div className="schedule">
        {relevantSections.map((section, idx) => {
          const key = `${section.section_id}-${idx}`;
          const contentId = `section-content-${course.code.departmental}-${key}`.replace(/\s+/g, "-");
          const isOpen = Boolean(openSections[key]);
          const timeCount = section.times?.length ?? 0;

          return (
            <div className={`section-block ${isOpen ? "open" : ""}`} key={key}>
              <button
                type="button"
                className="section-toggle"
                onClick={() => toggleSection(key)}
                aria-expanded={isOpen}
                aria-controls={contentId}
              >
                <span className="section-title">Section {section.section_id}</span>
                <span className="section-toggle-right">
                  <span className="section-meta">
                    {timeCount > 0 ? `${timeCount} meeting${timeCount > 1 ? "s" : ""}` : "No schedule"}
                  </span>
                  <i className={`fas fa-chevron-${isOpen ? "up" : "down"} section-toggle-icon`} />
                </span>
              </button>

              {isOpen && (
                <div className="section-content" id={contentId}>
                  {section.times?.map((t, timeIdx) => (
                    <Fragment key={timeIdx}>{renderTime(t)}</Fragment>
                  ))}
                  {renderInstructors(section.instructors)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
