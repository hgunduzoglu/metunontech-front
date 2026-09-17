import {
  ENGINEERING_FACULTY,
  LATEST_POINTER_URL,
  MAX_DEPARTMENTS_MISSING,
  NONTECHNICAL_ELECTIVE,
  PROGRAMS_URL,
  coursesUrl,
} from "./constants";
import type {
  Catalog,
  Course,
  CoursesPayload,
  ProgramsPayload,
  RawCourse,
  RawSection,
  TimeItem,
} from "./types";
import { formatUpdated } from "./utils";

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }

  return (await response.json()) as T;
};

// Course codes are seven digits: three for the department, four for the course
// itself, e.g. 3110210 -> ECON 210. Leading zeros are padding, not part of the
// number students use.
const courseNumber = (code: string): string =>
  code.slice(3).replace(/^0+(?=[0-9])/, "");

// The NTE lists each engineering department publishes, one set of course codes
// per department. A department with no list at all is left out rather than
// counted as a department that rejects everything.
const nonTechnicalListsOfEngineering = (programs: ProgramsPayload): Set<string>[] =>
  Object.values(programs.programs)
    .filter(
      (program) =>
        program.faculty_name === ENGINEERING_FACULTY &&
        program.program_type === "MAJOR" &&
        program.education_level === "Bachelor`s"
    )
    .map(
      (program) =>
        new Set(
          (program.electives ?? [])
            .filter(
              (elective) =>
                elective.category === NONTECHNICAL_ELECTIVE && elective.code
            )
            .map((elective) => String(elective.code))
        )
    )
    .filter((codes) => codes.size > 0);

// A course belongs on this site when nearly every engineering department calls
// it a non-technical elective. The slack is what rescues the courses one or two
// departments happen not to open.
export const sharedNonTechnicalCodes = (programs: ProgramsPayload): Set<string> => {
  const lists = nonTechnicalListsOfEngineering(programs);
  const threshold = lists.length - MAX_DEPARTMENTS_MISSING;
  const departmentsListing = new Map<string, number>();

  for (const codes of lists) {
    for (const code of codes) {
      departmentsListing.set(code, (departmentsListing.get(code) ?? 0) + 1);
    }
  }

  const shared = new Set<string>();
  for (const [code, count] of departmentsListing) {
    if (count >= threshold) shared.add(code);
  }

  return shared;
};

const toTimes = (section: RawSection): TimeItem[] =>
  (section.schedule ?? [])
    .filter((slot) => slot.day && slot.start_hour && slot.end_hour)
    .map((slot) => ({
      day: slot.day as string,
      start: slot.start_hour,
      end: slot.end_hour,
      room: slot.classroom || slot.building || "",
    }));

const toCourse = (
  code: string,
  departmentShortName: string,
  course: RawCourse
): Course => ({
  code: {
    departmental: `${departmentShortName} ${courseNumber(code)}`,
    numeric: code,
  },
  name: course.name ?? "",
  credits: course.credits?.total ?? "",
  sections: Object.values(course.sections ?? {}).map((section, index) => ({
    section_id: section.section_number ?? index + 1,
    times: toTimes(section),
    instructors: (section.instructors ?? [])
      .map((instructor) => instructor.name)
      .filter((name): name is string => Boolean(name)),
  })),
});

// Keeps only the shared electives that are actually offered this semester: the
// departmental lists carry courses that are not opened every term.
const openSharedCourses = (
  catalogue: CoursesPayload,
  shared: Set<string>
): Course[] => {
  const courses: Course[] = [];

  for (const department of Object.values(catalogue.programs)) {
    for (const [code, course] of Object.entries(department.courses ?? {})) {
      if (shared.has(code)) {
        courses.push(toCourse(code, department.short_name ?? "", course));
      }
    }
  }

  return courses;
};

export const loadCatalog = async (): Promise<Catalog> => {
  const pointer = await fetchJson<{ latest: string }>(LATEST_POINTER_URL);
  const [catalogue, programs] = await Promise.all([
    fetchJson<CoursesPayload>(coursesUrl(pointer.latest)),
    fetchJson<ProgramsPayload>(PROGRAMS_URL),
  ]);

  const updatedAt = catalogue.metadata?.updated_at;

  return {
    courses: openSharedCourses(catalogue, sharedNonTechnicalCodes(programs)),
    semester: catalogue.metadata?.semester_name ?? "",
    updatedAt: formatUpdated(updatedAt ? new Date(updatedAt) : new Date()),
  };
};
