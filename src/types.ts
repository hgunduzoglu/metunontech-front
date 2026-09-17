export interface TimeItem {
    day: number | string;
    start?: string;
    end?: string;
    room?: string;
  }
  
  export interface Section {
    section_id: string | number;
    times: TimeItem[];
    instructors?: string[];
  }
  
  export interface CodeInfo {
    departmental: string;
    numeric: string;
    matched_by?: string;
  }
  
  export interface Course {
    code: CodeInfo;
    name: string;
    credits: string | number;
    sections: Section[];
  }
  
  export type Availability = Record<number, number[] | null>; // day -> null (all day) | selected slot indices

// ---------------------------------------------------------------------------
// The shapes robotdegilim.xyz uploads to S3. Only the fields this site reads
// are described here.

export interface RawSchedule {
  day?: string;
  start_hour?: string;
  end_hour?: string;
  classroom?: string;
  building?: string;
}

export interface RawSection {
  section_number?: number | string;
  schedule?: RawSchedule[];
  instructors?: { name?: string }[];
}

export interface RawCourse {
  name?: string;
  credits?: { total?: number };
  sections?: Record<string, RawSection>;
}

export interface RawDepartment {
  short_name?: string;
  courses?: Record<string, RawCourse>;
}

export interface CoursesPayload {
  metadata?: { semester_name?: string; updated_at?: string };
  programs: Record<string, RawDepartment>;
}

export interface RawProgram {
  short_name?: string;
  faculty_name?: string;
  program_type?: string;
  education_level?: string;
  electives?: { code?: string | number; category?: string }[];
}

export interface ProgramsPayload {
  programs: Record<string, RawProgram>;
}

export interface Catalog {
  courses: Course[];
  semester: string;
  updatedAt: string;
}
