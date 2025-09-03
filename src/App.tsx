import { useEffect, useMemo, useState } from "react";
import ThemeSwitcher from "./components/ThemeSwitcher";
import DayTimeSelector from "./components/DayTimeSelector";
import CourseCard from "./components/CourseCard";
import {
  hasUnscheduledSection,
  hasValidSchedule,
  isCourseCompatible,
  isSectionCompatibleWithAvailability,
} from "./utils";
import type { Availability, Course } from "./types";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState<string>("");
  const [hideUnscheduled, setHideUnscheduled] = useState<boolean>(false);
  const [availability, setAvailability] = useState<Availability>({});

  useEffect(() => {
    fetch("/nte_time_with_codes.json")
      .then((r) => r.json())
      .then((data: Course[]) => setCourses(data))
      .catch((e) => console.error("Error loading JSON:", e));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    let arr = courses.filter((course) => {
      const dep = course.code.departmental.toLowerCase();
      const num = (course.code.numeric || "").toString().toLowerCase();
      return dep.includes(term) || num.includes(term) || course.name.toLowerCase().includes(term);
    });

    if (hideUnscheduled) {
      arr = arr
        .filter((cr) => hasValidSchedule(cr))
        .filter((cr) => isCourseCompatible(cr, availability));
    } else {
      arr = arr.filter((cr) => {
        if (hasUnscheduledSection(cr)) return true;
        return isCourseCompatible(cr, availability);
      });
    }

    return arr;
  }, [courses, search, hideUnscheduled, availability]);

  return (
    <>
      <ThemeSwitcher />

      <div className="container">
        <header>
          <h1>METU Non-Technical Elective Course Catalog</h1>
          <p>
            The courses below are <strong>2024-25 Summer</strong> semester non-technical elective
            courses that are currently open for <strong>ALL</strong> departments.
          </p>
          <p>Select all of your available time slots to see exact courses available for your schedule.</p>
          <p>You can also search for courses by code or name.</p>
          <p>Updated on <strong>02:15 06.07.2025</strong></p>
          <p>
            In case of any bug, recommendation etc you can contact us via{" "}
            <strong>destek@metu-non.tech</strong>
          </p>
        </header>

        <div className="creators">
          <p>
            Created by <span>hgunduzoglu</span> & <span>topcunht</span> & <span>AEV</span>
          </p>
        </div>

        <div className="search-container">
          <input
            id="searchInput"
            type="text"
            placeholder="Search for courses by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <h2>Choose Your Availability</h2>
          <div className="reminder">
            * Please select a day first, then choose a time slot.
          </div>
          <div className="reminder">
            * You need to select all of the lecture hours of a section to see it. If you select only
            the day without any time slot, you will be considered as available all day.
          </div>

          <DayTimeSelector
            availability={availability}
            setAvailability={setAvailability}
            onChange={() => {}}
          />

          <div className="hide-unscheduled">
            <button
              id="hideUnscheduledBtn"
              className={`hide-unscheduled-button ${hideUnscheduled ? "active" : ""}`}
              title="Toggle visibility of unscheduled courses"
              onClick={() => setHideUnscheduled((v) => !v)}
            >
              <i className={`fas ${hideUnscheduled ? "fa-eye" : "fa-eye-slash"}`} />
              <span>{hideUnscheduled ? "Show Unscheduled Courses" : "Hide Unscheduled Courses"}</span>
            </button>
          </div>
        </div>

        <div className="total-courses">
          <p>
            Total Courses: <span id="courseCount">{filtered.length}</span>
          </p>
        </div>

        <div className="reminder">
          <p>
            For DEPARTMENT OF MUSIC AND FINE ARTS courses, please check{" "}
            <a
              href="https://mgsb.metu.edu.tr/en/announcement/department-music-and-fine-arts-2024-2025-spring-semester-course-program"
              target="_blank" rel="noreferrer">this announcement</a>.
          </p>
          <p>
            For BA2204 course, please check{" "}
            <a href="https://ba.metu.edu.tr/" target="_blank" rel="noreferrer">
              Department of Business Administration website
            </a>.
          </p>
        </div>

        <div className="courses-grid" id="coursesGrid">
          {filtered.map((course) => (
            <CourseCard
              key={`${course.code.departmental}-${course.code.numeric}`}
              course={course}
              availability={availability}
            />
          ))}
        </div>
      </div>
    </>
  );
}
