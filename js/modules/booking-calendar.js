// Booking Calendar — shows confirmed booking dates (date + time only, no PII)
import { escapeHTML } from "./ui.js";

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
  ? "http://localhost:3005" 
  : "";
const API_URL = `${API_BASE}/api/confirmed-bookings`;

/**
 * Initialize the bookings calendar inside #booking-calendar-root
 */
export function initBookingCalendar() {
  const root = document.getElementById("booking-calendar-root");
  if (!root) return;

  const state = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    bookings: [], // [{date: "2026-03-20", time: "10:00"}, ...]
  };

  fetchBookings(state).then(() => render(root, state));
}

async function fetchBookings(state) {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      state.bookings = json.data;
    }
  } catch {
    state.bookings = [];
  }
}

function render(root, state) {
  root.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.className = "cal-header";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "cal-nav-btn";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.addEventListener("click", () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    render(root, state);
  });

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "cal-nav-btn";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.addEventListener("click", () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    render(root, state);
  });

  const monthLabel = document.createElement("span");
  monthLabel.className = "cal-month-label";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  monthLabel.textContent = `${months[state.currentMonth]} ${state.currentYear}`;

  header.appendChild(prevBtn);
  header.appendChild(monthLabel);
  header.appendChild(nextBtn);
  root.appendChild(header);

  // Day names
  const dayRow = document.createElement("div");
  dayRow.className = "cal-days-row";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const el = document.createElement("span");
    el.className = "cal-day-name";
    el.textContent = d;
    dayRow.appendChild(el);
  });
  root.appendChild(dayRow);

  // Build calendar grid
  const grid = document.createElement("div");
  grid.className = "cal-grid";

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

  // Empty cells for leading days
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell cal-empty";
    grid.appendChild(empty);
  }

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(state.currentYear, state.currentMonth, day);
    const dayBookings = state.bookings.filter((b) => b.date === dateStr);
    const isBooked = dayBookings.length > 0;
    const isToday = dateStr === todayStr;

    const cell = document.createElement("div");
    cell.className = `cal-cell${isBooked ? " cal-booked" : ""}${isToday ? " cal-today" : ""}`;

    const dayNum = document.createElement("span");
    dayNum.className = "cal-day-num";
    dayNum.textContent = day;
    cell.appendChild(dayNum);

    if (isBooked) {
      const dot = document.createElement("span");
      dot.className = "cal-dot";
      cell.appendChild(dot);

      // Tooltip with times and created_at
      const details = dayBookings
        .map((b) => {
          let str = b.time ? escapeHTML(b.time) : "Confirmed";
          if (b.created_at) {
            const dateObj = new Date(b.created_at);
            if (!isNaN(dateObj)) {
              str += ` (Booked: ${dateObj.toLocaleDateString()})`;
            }
          }
          return str;
        })
        .filter(Boolean)
        .join("\n");
        
      if (details) {
        cell.setAttribute("title", details);
      }
    }

    grid.appendChild(cell);
  }

  root.appendChild(grid);

  // Legend
  const legend = document.createElement("div");
  legend.className = "cal-legend";
  legend.innerHTML =
    '<span class="cal-legend-item"><span class="cal-dot"></span> Confirmed Booking</span>';
  root.appendChild(legend);
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
