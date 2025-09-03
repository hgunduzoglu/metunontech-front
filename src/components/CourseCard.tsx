import { DAYS } from "../constants";
import type { Availability, Course, Section, TimeItem } from "../types";
import { isSectionCompatibleWithAvailability } from "../utils";

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

  return (
    <div className="course-card">
      <h2>{course.code.departmental}</h2>
      <p className="course-code-numeric">Code: {course.code.numeric}</p>
      <p className="course-name">{course.name}</p>
      <p className="credits">Credits: {course.credits}</p>

      <div className="schedule">
        {relevantSections.map((section) => (
          <div className="section-block" key={section.section_id}>
            <h3>Section {section.section_id}</h3>
            {section.times?.map((t, idx) => (
  // ekstra wrapper yok
                <>{renderTime(t)}</>
                ))
            }
            {renderInstructors(section.instructors)}
          </div>
        ))}
      </div>
    </div>
  );
}
