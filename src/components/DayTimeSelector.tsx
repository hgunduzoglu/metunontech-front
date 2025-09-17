import { DAYS, TIME_SLOTS } from "../constants";
import type { Availability } from "../types";

interface Props {
  availability: Availability;
  onAvailabilityChange: (a: Availability) => void;
}

export default function DayTimeSelector({ availability, onAvailabilityChange }: Props) {
  const toggleDay = (dayValue: number) => {
    const next: Availability = { ...availability };
    if (Object.prototype.hasOwnProperty.call(next, dayValue)) {
      delete next[dayValue];
    } else {
      next[dayValue] = null;
    }
    onAvailabilityChange(next);
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
    onAvailabilityChange(next);
  };

  const isDaySelected = (d: number) => Object.prototype.hasOwnProperty.call(availability, d);
  const isSlotSelected = (d: number, s: number) =>
    isDaySelected(d) && Array.isArray(availability[d]) && (availability[d] as number[]).includes(s);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Müsaitlik Durumu
      </h2>
      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isDaySelected(day.value)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
              {isDaySelected(day.value) && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Zaman dilimi seçin veya tüm gün için boş bırakın
                </span>
              )}
            </div>

            {isDaySelected(day.value) && (
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.index}
                    type="button"
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      isSlotSelected(day.value, slot.index)
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => toggleSlot(day.value, slot.index)}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
