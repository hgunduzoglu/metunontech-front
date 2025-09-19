import { useEffect, useMemo, useState } from "react";
import ThemeSwitcher from "./components/ThemeSwitcher";
import DayTimeSelector from "./components/DayTimeSelector";
import CourseCard from "./components/CourseCard";
import { hasUnscheduledSection, hasValidSchedule, isCourseCompatible, formatUpdated } from "./utils";
import { COURSES_API_URL, LAST_UPDATED_API_URL } from "./constants";
import type { Availability, Course } from "./types";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState<string>("");
  const [hideUnscheduled, setHideUnscheduled] = useState<boolean>(false);
  const [availability, setAvailability] = useState<Availability>({});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [semester, setSemester] = useState<string>("2025-26 Fall");

  useEffect(() => {
    // Kursları S3'ten yükle
    const loadCourses = async () => {
      try {
        const res = await fetch(COURSES_API_URL);
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (e) {
        console.error("Error loading courses from S3:", e);
      }
    };

    // Son değiştirilme zamanını ve dönem bilgisini lastUpdated.json'dan al
    const loadUpdated = async () => {
      try {
        const res = await fetch(LAST_UPDATED_API_URL);
        const statusData = await res.json();
        
        // Dönem bilgisini al (t field'ı) ve 20251: gibi prefix'i temizle
        if (statusData.t) {
          let semesterText = statusData.t;
          // 20251: gibi prefix'i kaldır
          semesterText = semesterText.replace(/^\d+:\s*/, '');
          setSemester(semesterText);
        }
        
        // Güncelleme zamanını al (u field'ı) - string olarak geliyorsa parse et
        if (statusData.u) {
          const updateTime = typeof statusData.u === 'string' ? statusData.u : new Date(statusData.u).toISOString();
          setUpdatedAt(updateTime);
        } else {
          setUpdatedAt(formatUpdated(new Date()));
        }
      } catch (e) {
        console.error("Error loading lastUpdated from S3:", e);
        setUpdatedAt(formatUpdated(new Date()));
      }
    };

    loadCourses();
    loadUpdated();
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
            The courses below are <strong>{semester}</strong> semester non-technical elective
            courses that are currently open for <strong>ALL</strong> departments.
          </p>
          <p>Select all of your available time slots to see exact courses available for your schedule.</p>
          <p>You can also search for courses by code or name.</p>
          <p>Updated on <strong>{updatedAt || "..."}</strong></p>
          <p>
            In case of any bug, recommendation etc you can contact us via{" "}
            <strong>destek@metu-non.tech</strong>
          </p>
          <p>Please fill the form below with low-effort free electives you took or heard about. We will add them.</p>
          <div className="form-button-container">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeXbKNVfatPsnV0m2hDM4LKKgljJ6hlvgOO_B5HiHd0OeyT0Q/viewform?usp=send_form"
              target="_blank"
              rel="noreferrer"
              className="form-button"
            >
              Free Elective Form
            </a>
          </div>
        </header>

        {/* Search */}
        <div className="search-container">
          <input
            id="searchInput"
            type="text"
            placeholder="Search for courses by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
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

        {/* Total */}
        <div className="total-courses">
          <p>
            Total Courses: <span id="courseCount">{filtered.length}</span>
          </p>
        </div>

        {/* Reminders */}
        <div className="reminder">
          <p>
            For DEPARTMENT OF MUSIC AND FINE ARTS courses, please check{" "}
            <a
              href="https://mgsb.metu.edu.tr/en/announcement/department-music-and-fine-arts-2024-2025-spring-semester-course-program"
              target="_blank"
              rel="noreferrer"
            >
              this announcement
            </a>
            .
          </p>
          <p>
            For BA2204 course, please check{" "}
            <a href="https://ba.metu.edu.tr/" target="_blank" rel="noreferrer">
              Department of Business Administration website
            </a>
            .
          </p>
        </div>

        {/* Grid */}
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
