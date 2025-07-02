// =========================
// script.js (TÜM KOD)
// =========================

// Theme Switcher Functionality
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
  // Theme initialization
  initializeTheme();
  
  // Add theme switcher click event
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', toggleTheme);
  }

  // Course functionality initialization
  buildDayTimeSelection();
  startApp();

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', renderCourses);

  // Hide unscheduled courses functionality
  const hideUnscheduledBtn = document.getElementById('hideUnscheduledBtn');
  if (hideUnscheduledBtn) {
    hideUnscheduledBtn.addEventListener('click', () => {
      hideUnscheduled = !hideUnscheduled;
      hideUnscheduledBtn.classList.toggle('active');
      const icon = hideUnscheduledBtn.querySelector('i');
      const text = hideUnscheduledBtn.querySelector('span');
      
      if (hideUnscheduled) {
        icon.className = 'fas fa-eye';
        text.textContent = 'Show Unscheduled Courses';
      } else {
        icon.className = 'fas fa-eye-slash';
        text.textContent = 'Hide Unscheduled Courses';
      }
      renderCourses();
    });
  }
});

// Static course data
let courseData = [];
let hideUnscheduled = false;

// Get DOM elements
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const courseCountElement = document.getElementById('courseCount');
const dayTimeSelection = document.getElementById('dayTimeSelection');
const filterBtn = document.getElementById('filterBtn');

// Gün + Slot tanımları
const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" }
];

// 08:40-17:30 => 9 aralık
const TIME_SLOTS = [
  { index: 0, label: "08:40-09:30", start: "08:40", end: "09:30" },
  { index: 1, label: "09:40-10:30", start: "09:40", end: "10:30" },
  { index: 2, label: "10:40-11:30", start: "10:40", end: "11:30" },
  { index: 3, label: "11:40-12:30", start: "11:40", end: "12:30" },
  { index: 4, label: "12:40-13:30", start: "12:40", end: "13:30" },
  { index: 5, label: "13:40-14:30", start: "13:40", end: "14:30" },
  { index: 6, label: "14:40-15:30", start: "14:40", end: "15:30" },
  { index: 7, label: "15:40-16:30", start: "15:40", end: "16:30" },
  { index: 8, label: "16:40-17:30", start: "16:40", end: "17:30" }
];

// Ana veri kaynağını (JSON) yükle ve sayfayı başlat
function startApp() {
  fetch("nte_time_with_codes_v8.json")
    .then(res => res.json())
    .then(data => {
      courseData = data;
      renderCourses();
    })
    .catch(err => console.error("Error loading JSON:", err));
}

// Gün/Slot seçim UI inşası
function buildDayTimeSelection() {
  DAYS.forEach(dayObj => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'availability-row';

    // Day button
    const dayButton = document.createElement('button');
    dayButton.type = 'button';
    dayButton.value = dayObj.value;
    dayButton.className = 'day-button';
    dayButton.setAttribute('data-selected', 'false');
    dayButton.textContent = dayObj.label;

    const dayLabel = document.createElement('div');
    dayLabel.className = 'day-label';
    dayLabel.appendChild(dayButton);

    // Slot container
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'slots-container';

    // 9 slot as buttons
    TIME_SLOTS.forEach(slot => {
      const slotButton = document.createElement('button');
      slotButton.type = 'button';
      slotButton.value = slot.index;
      slotButton.disabled = true; // başta kapalı
      slotButton.className = 'slot-button';
      slotButton.setAttribute('data-day', dayObj.value);
      slotButton.setAttribute('data-selected', 'false');
      
      const spanText = document.createElement('span');
      spanText.textContent = slot.label;
      slotButton.appendChild(spanText);

      // Click handler for the slot button
      slotButton.addEventListener('click', () => {
        const isSelected = slotButton.getAttribute('data-selected') === 'true';
        slotButton.setAttribute('data-selected', !isSelected);
        slotButton.classList.toggle('selected', !isSelected);
        
        // Trigger filtering automatically
        renderCourses();
      });

      slotsContainer.appendChild(slotButton);
    });

    // Day button click handler
    dayButton.addEventListener('click', () => {
      const isSelected = dayButton.getAttribute('data-selected') === 'true';
      const willBeSelected = !isSelected;
      dayButton.setAttribute('data-selected', willBeSelected);
      dayButton.classList.toggle('selected', willBeSelected);
      
      const slotButtons = slotsContainer.querySelectorAll('.slot-button');
      slotButtons.forEach(button => {
        // enable/disable the time slots based on day selection
        button.disabled = !willBeSelected;
        // when day is deselected, also deselect all its time slots
        if (!willBeSelected) {
          button.setAttribute('data-selected', 'false');
          button.classList.remove('selected');
        }
      });
      
      // Trigger filtering automatically
      renderCourses();
    });

    rowDiv.appendChild(dayLabel);
    rowDiv.appendChild(slotsContainer);
    dayTimeSelection.appendChild(rowDiv);
  });
}

// Kullanıcı seçimini availability objesine dönüştür
function getAvailabilityFromUI() {
  const availability = {};

  const dayButtons = document.querySelectorAll('.day-button');
  dayButtons.forEach(dayBtn => {
    if (dayBtn.getAttribute('data-selected') === 'true') {
      const dayVal = parseInt(dayBtn.value, 10);
      // Get all slot buttons for this day
      const slotButtons = document.querySelectorAll(`.slot-button[data-day="${dayVal}"]`);
      const chosenSlots = [];
      slotButtons.forEach(button => {
        if (button.getAttribute('data-selected') === 'true') {
          chosenSlots.push(parseInt(button.value, 10));
        }
      });
      // Eğer chosenSlots.length === 0 => tam gün
      if (chosenSlots.length === 0) {
        availability[dayVal] = null; 
      } else {
        availability[dayVal] = chosenSlots;
      }
    }
  });

  return availability;
}

// Yardımcı fonksiyonlar

function toMinutes(hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

// Slot aralığına göre TIME_SLOTS'daki indexleri bulur
function getSlotIndexesForTimeRange(startStr, endStr) {
  const startM = toMinutes(startStr);
  const endM = toMinutes(endStr);

  const matched = [];
  for (let s of TIME_SLOTS) {
    const slotStart = toMinutes(s.start);
    const slotEnd = toMinutes(s.end);
    if (slotStart >= startM && slotEnd <= endM) {
      matched.push(s.index);
    }
  }
  return matched;
}

// Bir section'ın tüm times'ları availability'ye uyuyor mu?
function isSectionCompatibleWithAvailability(section, availability) {
  for (let tItem of section.times) {
    if (tItem.day === "No Timestamp Added Yet, Please Check Announcements Of The Department." ||
        tItem.day === "No Timestamp Added Yet") {
      // Bu time kaydı hiçbir kısıt getirmesin:
      continue;
    }
    let dVal = tItem.day;
    if (typeof dVal === 'string') {
      dVal = convertDayStringToNumber(dVal);
    }
    // Eğer user bu günü seçmemişse => false
    if (!Object.prototype.hasOwnProperty.call(availability, dVal)) {
      return false;  
    }
    // availability[dVal] => null => tam gün
    const slotsOfDay = availability[dVal];
    if (slotsOfDay === null) {
      // tam gün => bu time bloğu direkt uyumlu
      continue;
    } else {
      // Belirli slotlar
      const neededSlots = getSlotIndexesForTimeRange(tItem.start, tItem.end);
      for (let ns of neededSlots) {
        if (!slotsOfDay.includes(ns)) {
          return false;
        }
      }
    }
  }
  // Tüm tItem'lar sorunsuz => section uyumlu
  return true;
}

// Bir dersin en az bir section'ı availability'ye uyuyor mu?
function isCourseCompatible(course, availability) {
  // Hiç gün seçilmediyse => tüm dersler gözüksün
  if (Object.keys(availability).length === 0) {
    return true;
  }
  return course.sections.some(sec => isSectionCompatibleWithAvailability(sec, availability));
}

// Unscheduled tanımı: en az bir şubede zaman bilgisi yok veya "No Timestamp" var
function hasUnscheduledSection(course) {
  return course.sections.some(section => {
    // times dizisi yoksa veya boşsa => unscheduled
    if (!section.times || section.times.length === 0) {
      return true;
    }
    // Tüm time satırları "No Timestamp" içeriyorsa => unscheduled
    return section.times.every(time =>
      typeof time.day === 'string' && time.day.includes("No Timestamp")
    );
  });
}

// Sadece en az bir schedule bilgisi olan kurs => "valid schedule"
function hasValidSchedule(course) {
  return course.sections.some(section => 
    section.times.some(time =>
      time.day !== "No Timestamp Added Yet, Please Check Announcements Of The Department." &&
      time.day !== "No Timestamp Added Yet"
    )
  );
}

function convertDayStringToNumber(dayStr) {
  const map = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6
  };
  return map[dayStr] ?? -1;
}

// ASIL KISIM: Arama + Filtre + Ekrana Basma
function renderCourses() {
  const searchTerm = searchInput.value.toLowerCase();
  const availability = getAvailabilityFromUI(); 

  // 1) Kod/isim arama
  let filtered = courseData.filter(course => {
    const departmentalCode = course.code.departmental.toLowerCase();
    const numericCode = course.code.numeric.toLowerCase();
    
    return departmentalCode.includes(searchTerm) ||
           numericCode.includes(searchTerm) ||
           course.name.toLowerCase().includes(searchTerm);
  });

  // 2) Hide/show unscheduled mantığı + zaman filtrelemesi
  if (hideUnscheduled) {
    // a) "Hide" => unscheduled'ları eleyelim
    //    => valid schedule && availability'ye uyum
    filtered = filtered
      .filter(cr => hasValidSchedule(cr))
      .filter(cr => isCourseCompatible(cr, availability));
  } else {
    // b) "Show" => eğer ders unscheduled ise zaman filtresini geçmese bile göster.
    //    scheduled ise => zaman filtresini geçmesi gerek
    filtered = filtered.filter(cr => {
      if (hasUnscheduledSection(cr)) {
        // En az bir unscheduled section varsa => kullanıcıya göster
        return true;
      } else {
        // Normal (scheduled) ders => zaman filtresine uyuyor mu?
        return isCourseCompatible(cr, availability);
      }
    });
  }

  // 3) Ekrana bas
  coursesGrid.innerHTML = '';
  filtered.forEach(course => {
    coursesGrid.appendChild(createCourseCard(course, availability));
  });
  updateCourseCount(filtered.length);
}

// Card oluşturma
function createCourseCard(course, availability) {
  const card = document.createElement('div');
  card.className = 'course-card';

  // availability boşsa => tüm section'ları göster
  // yoksa => sadece uyumlu section'ları al
  let relevantSections = course.sections;
  if (Object.keys(availability).length !== 0) {
    relevantSections = course.sections.filter(sec => isSectionCompatibleWithAvailability(sec, availability));
  }

  const sectionsHtml = relevantSections.map(section => {
    const timesHtml = section.times.map(time => {
      if (time.day === "No Timestamp Added Yet") {
        return `<div class="schedule-item"><span class="day">${time.day}</span></div>`;
      } else {
        let dVal = time.day;
        if (typeof dVal === 'number' && dVal >= 0 && dVal < DAYS.length) {
          dVal = DAYS[dVal].label;
        }
        return `
          <div class="schedule-item">
            <span class="day">${dVal}</span>
            <span class="time">${time.start} - ${time.end}</span>
            <span class="room">${time.room ? 'Room: ' + time.room : ''}</span>
          </div>
        `;
      }
    }).join('');

    // Eğitmen bilgisi (staff ayıklama)
    const instructorsHtml = section.instructors ? (() => {
      const filteredInstructors = section.instructors.filter(i => i !== "STAFF");
      if (filteredInstructors.length === 0) return '';
      
      return `
        <div class="instructors">
          <i class="fas fa-user-tie instructor-icon"></i>
          <span class="instructor-names">${filteredInstructors.join(' • ')}</span>
        </div>
      `;
    })() : '';

    return `
      <div class="section-block">
        <h3>Section ${section.section_id}</h3>
        ${timesHtml}
        ${instructorsHtml}
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <h2>${course.code.departmental}</h2>
    <p class="course-code-numeric">Code: ${course.code.numeric}</p>
    <p class="course-name">${course.name}</p>
    <p class="credits">Credits: ${course.credits}</p>
    <div class="schedule">
      ${sectionsHtml}
    </div>
  `;
  return card;
}

// Kurs sayısı
function updateCourseCount(count) {
  courseCountElement.textContent = count;
}
