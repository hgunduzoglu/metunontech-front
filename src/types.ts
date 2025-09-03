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
  