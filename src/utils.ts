import { TIME_SLOTS } from "./constants";
import type { Availability, Course, Section } from "./types";

export const toMinutes = (hhmm: string): number => {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
};

export const getSlotIndexesForTimeRange = (startStr: string, endStr: string): number[] => {
  const startM = toMinutes(startStr);
  const endM = toMinutes(endStr);
  const matched: number[] = [];
  for (const s of TIME_SLOTS) {
    const slotStart = toMinutes(s.start);
    const slotEnd = toMinutes(s.end);
    if (slotStart >= startM && slotEnd <= endM) matched.push(s.index);
  }
  return matched;
};

export const convertDayStringToNumber = (dayStr: string): number => {
  const map: Record<string, number> = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4,
    Saturday: 5, Sunday: 6,
  };
  return map[dayStr] ?? -1;
};

export const hasUnscheduledSection = (course: Course): boolean =>
  course.sections.some((section) => {
    if (!section.times || section.times.length === 0) return true;
    return section.times.every(
      (t) => typeof t.day === "string" && t.day.includes("No Timestamp")
    );
  });

export const hasValidSchedule = (course: Course): boolean =>
  course.sections.some((section) =>
    section.times.some(
      (t) =>
        t.day !==
          "No Timestamp Added Yet, Please Check Announcements Of The Department." &&
        t.day !== "No Timestamp Added Yet"
    )
  );

export const isSectionCompatibleWithAvailability = (
  section: Section,
  availability: Availability
): boolean => {
  for (const tItem of section.times) {
    if (
      tItem.day ===
        "No Timestamp Added Yet, Please Check Announcements Of The Department." ||
      tItem.day === "No Timestamp Added Yet"
    ) continue;

    let dVal: number =
      typeof tItem.day === "string" ? convertDayStringToNumber(tItem.day) : tItem.day;

    if (!Object.prototype.hasOwnProperty.call(availability, dVal)) return false;

    const slotsOfDay = availability[dVal];
    if (slotsOfDay === null) continue; // all-day available

    const neededSlots = getSlotIndexesForTimeRange(tItem.start || "", tItem.end || "");
    for (const ns of neededSlots) if (!slotsOfDay.includes(ns)) return false;
  }
  return true;
};

export const isCourseCompatible = (course: Course, availability: Availability): boolean => {
  if (Object.keys(availability).length === 0) return true;
  return course.sections.some((sec) =>
    isSectionCompatibleWithAvailability(sec, availability)
  );
};
