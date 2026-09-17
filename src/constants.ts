export const DAYS = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
  ] as const;
  
  export const TIME_SLOTS = [
    { index: 0, label: "08:40-09:30", start: "08:40", end: "09:30" },
    { index: 1, label: "09:40-10:30", start: "09:40", end: "10:30" },
    { index: 2, label: "10:40-11:30", start: "10:40", end: "11:30" },
    { index: 3, label: "11:40-12:30", start: "11:40", end: "12:30" },
    { index: 4, label: "12:40-13:30", start: "12:40", end: "13:30" },
    { index: 5, label: "13:40-14:30", start: "13:40", end: "14:30" },
    { index: 6, label: "14:40-15:30", start: "14:40", end: "15:30" },
    { index: 7, label: "15:40-16:30", start: "15:40", end: "16:30" },
    { index: 8, label: "16:40-17:30", start: "16:40", end: "17:30" },
  ] as const;

  // API endpoints. robotdegilim.xyz used to publish a ready-made nteAvailable.json;
  // it now uploads the raw scrape instead, so the catalogue and the degree
  // programmes are fetched separately and the NTE list is worked out here.
  const S3_BASE_URL = "https://s3.amazonaws.com/cdn.robotdegilim.xyz";
  export const LATEST_POINTER_URL = `${S3_BASE_URL}/data/scrape_courses/latest.json`;
  export const coursesUrl = (filename: string) =>
    `${S3_BASE_URL}/data/scrape_courses/${filename}`;
  export const PROGRAMS_URL = `${S3_BASE_URL}/data/scrape_programs/programs.json`;

  // Which courses belong on this site. Only Ankara's engineering departments
  // count: the faculty name is how programs.json separates them from the
  // Northern Cyprus programmes, which run a different course list altogether.
  export const ENGINEERING_FACULTY = "Faculty of Engineering";
  export const NONTECHNICAL_ELECTIVE = "NONTECHNICAL ELECTIVE";

  // A course counts as a shared non-technical elective when at most this many
  // engineering departments leave it out. Departments disagree at the edges --
  // some ECON courses are not open to IE but still count as an NTE for ME --
  // and demanding unanimity drops those for everyone.
  export const MAX_DEPARTMENTS_MISSING = 3;
  