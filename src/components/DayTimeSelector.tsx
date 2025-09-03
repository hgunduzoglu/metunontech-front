import { DAYS, TIME_SLOTS } from "../constants";
import type { Availability } from "../types";

interface Props {
  availability: Availability;
  setAvailability: (a: Availability) => void;
  onChange?: (a: Availability) => void;
}

export default function DayTimeSelector({ availability, setAvailability, onChange }: Props) {
  const toggleDay = (dayValue: number) => {
    const next: Availability = { ...availability };
    if (Object.prototype.hasOwnProperty.call(next, dayValue)) {
      delete next[dayValue];
    } else {
      next[dayValue] = null;
    }
    setAvailability(next);
    onChange?.(next);
  };

  const toggleSlot = (dayValue: number, slotIndex: number) => {
    const next: Availability = { ...availability };
    if (!Object.prototype.hasOwnProperty.call(next, dayValue)) {
      next[dayValue] = null;
    }
    const arr = next[dayValue];
    if (arr === null) {
      next[dayValue] = [slotIndex];
    } else {
      const has = arr.includes(slotIndex);
      next[dayValue] = has ? arr.filter((i) => i !== slotIndex) : [...arr, slotIndex];
      if ((next[dayValue] as number[]).length === 0) next[dayValue] = null;
    }
    setAvailability(next);
    onChange?.(next);
  };

  const isDaySelected = (d: number) => Object.prototype.hasOwnProperty.call(availability, d);
  const isSlotSelected = (d: number, s: number) =>
    isDaySelected(d) && Array.isArray(availability[d]) && (availability[d] as number[]).includes(s);

  return (
    <div id="dayTimeSelection">
      {DAYS.map((day) => (
        <div className="availability-row" key={day.value}>
          <div className="day-label">
            <button
              type="button"
              className={`day-button ${isDaySelected(day.value) ? "selected" : ""}`}
              data-selected={isDaySelected(day.value)}
              value={day.value}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          </div>

          <div className="slots-container">
            {TIME_SLOTS.map((slot) => {
              const daySelected = isDaySelected(day.value);
              return (
                <button
                  key={slot.index}
                  type="button"
                  className={`slot-button ${isSlotSelected(day.value, slot.index) ? "selected" : ""}`}
                  data-day={day.value}
                  data-selected={isSlotSelected(day.value, slot.index)}
                  disabled={!daySelected}
                  onClick={() => toggleSlot(day.value, slot.index)}
                >
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
