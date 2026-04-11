import { getTours } from "./tours.v2.js";

// --- Security Helper ---
export function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Toast Notification Logic ---
export function showToast(title, message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon =
    type === "success"
      ? '<i class="fas fa-check-circle"></i>'
      : '<i class="fas fa-exclamation-circle"></i>';
  toast.innerHTML = `
    ${icon}
    <div class="toast-content">
      <div class="toast-title"></div>
      <div class="toast-message"></div>
    </div>
    <div class="toast-close">&times;</div>
  `;
  const titleEl = toast.querySelector(".toast-title");
  if (titleEl) titleEl.textContent = title; // Safe
  const msgEl = toast.querySelector(".toast-message");
  if (msgEl) msgEl.textContent = message; // Safe

  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => toast.remove());
  }

  container.appendChild(toast);
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = "fadeOutToast 0.5s ease forwards";
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 5000);
}

// --- Browser-Friendly Input Focus Optimization ---
export function initInputFocus() {
  document.querySelectorAll("input, textarea, select").forEach((input) => {
    input.addEventListener("focus", () => {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    });
  });
}

// --- Phone Input Configuration (CSP Safe) ---
export function initPhoneInput() {
  if (typeof window.PhoneInput !== "undefined") {
    if (!window.phoneInputInstance) {
      const container = document.querySelector("#phone-input-container");
      if (container) {
        window.phoneInputInstance = new window.PhoneInput(
          "#phone-input-container",
          {
            defaultCountry: "MA",
          },
        );
        // Phone input initialized successfully
      } else {
        console.error("PhoneInput: Container #phone-input-container not found");
      }
    }
  } else {
    // console.warn("PhoneInput: Class not defined (check script loading order)");
  }
}

// --- Modern Carousel Logic ---
export function initCarousel() {
  const overlay = document.getElementById("image-carousel-overlay");
  if (!overlay) return;
  const track = overlay.querySelector(".carousel-image-container");
  const dotsContainer = document.getElementById("carousel-dots");
  const closeBtn = overlay.querySelector(".carousel-close-btn");
  const prevBtn = overlay.querySelector(".prev-btn");
  const nextBtn = overlay.querySelector(".next-btn");
  if (!track || !dotsContainer || !closeBtn) return;
  // Define global opener
  window.openCarousel = (tourId) => {
    const TOURS = getTours();
    const tour = TOURS[tourId];
    if (!tour || !tour.images) return;
    track.innerHTML = "";
    tour.images.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      slide.innerHTML = `<img src="${src}" alt="${tour.title}" loading="lazy">`;
      track.appendChild(slide);
    });
    dotsContainer.innerHTML = "";
    tour.images.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = "carousel-dot" + (idx === 0 ? " active" : "");
      dotsContainer.appendChild(dot);
    });
    overlay.style.display = "flex";
    setTimeout(() => overlay.classList.add("active"), 10);
    document.body.style.overflow = "hidden";
    track.scrollLeft = 0;
    // Hide Navbar
    const nav = document.querySelector("nav");
    if (nav) nav.style.display = "none";
  };
  const closeCarousel = () => {
    overlay.classList.remove("active");
    setTimeout(() => (overlay.style.display = "none"), 100);
    document.body.style.overflow = "";
    // Show Navbar
    const nav = document.querySelector("nav");
    if (nav) nav.style.display = "";
  };
  track.addEventListener("scroll", () => {
    const slideWidth = track.offsetWidth;
    if (slideWidth === 0) return;
    const index = Math.round(track.scrollLeft / slideWidth);
    const dots = dotsContainer.querySelectorAll(".carousel-dot");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === index);
    });
  });
  closeBtn.addEventListener("click", closeCarousel);
  const backdrop = overlay.querySelector(".carousel-backdrop");
  if (backdrop) backdrop.addEventListener("click", closeCarousel);
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      track.scrollBy({
        left: track.offsetWidth,
        behavior: "smooth",
      });
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      track.scrollBy({
        left: -track.offsetWidth,
        behavior: "smooth",
      });
    });
  }
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape") closeCarousel();
    if (e.key === "ArrowRight")
      track.scrollBy({
        left: track.offsetWidth,
        behavior: "smooth",
      });
    if (e.key === "ArrowLeft")
      track.scrollBy({
        left: -track.offsetWidth,
        behavior: "smooth",
      });
  });
}

export function closeModal() {
  const modal = document.getElementById("detailsModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
    // Show Navbar
    const nav = document.querySelector("nav");
    if (nav) nav.style.display = "";
  }
}

// --- Custom Modern Time Dropdown Logic ---
const TIME_OPTIONS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

export function initCustomTimeDropdown() {
  const input = document.getElementById("time");
  const optionsContainer = document.getElementById("time-dropdown-options");
  const wrapper = document.querySelector(".custom-dropdown-wrapper");
  if (!input || !optionsContainer) return;
  function renderOptions(filterText = "") {
    if (!optionsContainer) return;
    optionsContainer.innerHTML = "";
    const lowerFilter = filterText.toLowerCase();
    const filtered = TIME_OPTIONS.filter((t) => t.includes(lowerFilter));
    if (filtered.length === 0) {
      optionsContainer.innerHTML = `<div class="custom-option" style="cursor: default; color: #999;">No time found</div>`;
      return;
    }
    filtered.forEach((time) => {
      const div = document.createElement("div");
      div.className = "custom-option";
      if (input.value === time) div.classList.add("selected");
      div.innerText = time;
      div.addEventListener("click", () => {
        input.value = time;
        closeDropdown();
        input.setCustomValidity("");
      });
      optionsContainer.appendChild(div);
    });
  }
  function openDropdown() {
    renderOptions(input.value);
    if (optionsContainer) optionsContainer.classList.add("active");
  }
  function closeDropdown() {
    setTimeout(() => {
      if (optionsContainer) optionsContainer.classList.remove("active");
      validateTimeInput();
    }, 200);
  }
  function validateTimeInput() {
    const val = input.value;
    if (val && !TIME_OPTIONS.includes(val)) {
      input.setCustomValidity(
        "Please select a valid time from the list (e.g. 14:00)",
      );
    } else {
      input.setCustomValidity("");
    }
  }
  input.addEventListener("focus", openDropdown);
  input.addEventListener("input", () => {
    let val = input.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      input.value = val.substring(0, 2) + ":" + val.substring(2);
    } else {
      input.value = val;
    }
    openDropdown();
    renderOptions(input.value);
  });
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (wrapper && !wrapper.contains(target) && optionsContainer) {
      optionsContainer.classList.remove("active");
    }
  });
}

// Update active nav item on scroll
export function updateActiveNavItem() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  let current = "";
  const scrollPosition = window.scrollY + 100;
  sections.forEach((section) => {
    const htmlSection = section;
    const sectionTop = htmlSection.offsetTop;
    const sectionHeight = htmlSection.offsetHeight;
    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      const id = section.getAttribute("id");
      if (id) current = id;
    }
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// --- FAQ Accordion Logic ---
// --- FAQ Accordion Logic ---
export function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("click", () => {
      const question = item.querySelector(".faq-question");
      if (!question) return;

      const expanded = question.getAttribute("aria-expanded") === "true";

      // Close all others
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherQ = otherItem.querySelector(".faq-question");
          if (otherQ) otherQ.setAttribute("aria-expanded", "false");
          const otherAns = otherItem.querySelector(".faq-answer");
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      // Toggle current
      question.setAttribute("aria-expanded", !expanded);
      const answer = item.querySelector(".faq-answer");
      if (!expanded) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        answer.style.maxHeight = null;
      }
    });
  });
}
