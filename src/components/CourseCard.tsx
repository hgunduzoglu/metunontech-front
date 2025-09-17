import { DAYS } from "../constants";
import type { Course, Section, TimeItem } from "../types";
import { Fragment } from "react";

interface Props {
  course: Course;
  hasUnscheduled: boolean;
}

const renderTime = (t: TimeItem) => {
  if (t.day === "No Timestamp Added Yet" || t.day === "No Timestamp Added Yet, Please Check Announcements Of The Department.") {
    return (
      <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium">Zaman belirtilmemiş</span>
      </div>
    );
  }
  
  let dLabel: string | number = t.day;
  if (typeof dLabel === "number" && dLabel >= 0 && dLabel < DAYS.length) {
    dLabel = DAYS[dLabel].label;
  }
  
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4m0 0V3a1 1 0 012 0v4m0 0h4a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h4z" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-white">{dLabel}</span>
      </div>
      {t.start && t.end && (
        <div className="flex items-center space-x-1">
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">{t.start} - {t.end}</span>
        </div>
      )}
      {t.room && (
        <div className="flex items-center space-x-1">
          <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">{t.room}</span>
        </div>
      )}
    </div>
  );
};

const renderInstructors = (arr?: string[]) => {
  if (!arr || arr.length === 0) return null;
  const filtered = arr.filter((i) => i !== "STAFF");
  if (filtered.length === 0) return null;
  return (
    <div className="flex items-center space-x-2 mt-2">
      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="text-sm text-gray-600 dark:text-gray-400">{filtered.join(" • ")}</span>
    </div>
  );
};

export default function CourseCard({ course, hasUnscheduled }: Props) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {course.code.departmental}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Kod: {course.code.numeric} • Kredi: {course.credits}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{course.name}</p>
        </div>
        {hasUnscheduled && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full">
            <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-200">Programsız</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {course.sections.map((section) => (
          <div key={section.section_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Şube {section.section_id}
            </h4>
            <div className="space-y-2">
              {section.times?.map((t, idx) => (
                <Fragment key={idx}>{renderTime(t)}</Fragment>
              ))}
            </div>
            {renderInstructors(section.instructors)}
          </div>
        ))}
      </div>
    </div>
  );
}
