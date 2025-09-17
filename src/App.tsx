import { useEffect, useMemo, useState } from "react";
import ThemeSwitcher from "./components/ThemeSwitcher";
import DayTimeSelector from "./components/DayTimeSelector";
import CourseCard from "./components/CourseCard";
import { hasUnscheduledSection, hasValidSchedule, isCourseCompatible, formatUpdated } from "./utils";
import { COURSES_API_URL } from "./constants";
import type { Availability, Course } from "./types";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState<string>("");
  const [hideUnscheduled, setHideUnscheduled] = useState<boolean>(false);
  const [availability, setAvailability] = useState<Availability>({});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Kursları S3'ten yükle
    const loadCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(COURSES_API_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Course[] = await res.json();
        setCourses(data);
        
        // Son değiştirilme zamanını response header'dan al
        const lastModified = res.headers.get("last-modified");
        if (lastModified) {
          setUpdatedAt(formatUpdated(new Date(lastModified)));
        } else {
          setUpdatedAt(formatUpdated(new Date()));
        }
      } catch (e) {
        console.error("Error loading courses from S3:", e);
        setError(`Kurs verileri yüklenirken hata oluştu: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
        setUpdatedAt(formatUpdated(new Date()));
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(term) ||
        course.code.departmental.toLowerCase().includes(term) ||
        course.code.numeric.includes(term);
      const matchesFilter = hideUnscheduled ? hasValidSchedule(course) : true;
      const matchesAvailability = isCourseCompatible(course, availability);
      return matchesSearch && matchesFilter && matchesAvailability;
    });
  }, [courses, search, hideUnscheduled, availability]);

  const handleAvailabilityChange = (newAvailability: Availability) => {
    setAvailability(newAvailability);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                METU NTE Course Schedule
              </h1>
              {updatedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Son güncelleme: {updatedAt}
                </p>
              )}
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Hata</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kurs verileri yükleniyor...
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Arama ve Filtreler
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kurs Ara
                      </label>
                      <input
                        id="search"
                        type="text"
                        placeholder="Kurs adı veya kodu ile ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="hide-unscheduled"
                        type="checkbox"
                        checked={hideUnscheduled}
                        onChange={(e) => setHideUnscheduled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label htmlFor="hide-unscheduled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Zamanı belirtilmemiş kursları gizle
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <DayTimeSelector 
                  availability={availability} 
                  onAvailabilityChange={handleAvailabilityChange} 
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kurslar ({filtered.length})
                </h2>
              </div>
              
              {filtered.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Kurs bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Arama kriterlerinizi değiştirmeyi deneyin.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((course, index) => (
                    <CourseCard
                      key={`${course.code.departmental}-${course.code.numeric}-${index}`}
                      course={course}
                      hasUnscheduled={hasUnscheduledSection(course)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
