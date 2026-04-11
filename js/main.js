import {
  renderTours,
  toggleAllInSection,
  toggleTour,
  removeTourById,
  showTourDetails,
  toggleTransport,
  updateSelectedToursDisplay,
  updateAllButtons,
} from "./modules/tours.v2.js";
import { loadFromLocalStorage } from "./state.js";
import {
  updateActiveNavItem,
  initPhoneInput,
  initCarousel,
  initCustomTimeDropdown,
  closeModal,
  showToast,
  initFAQ,
} from "./modules/ui.js";
import { initReviews } from "./modules/reviews-logic.v2.js";
import {
  handleReservation,
  showConfirmationModal,
  closeConfirmationModal,
  confirmClearAll,
  updateGuestCount,
} from "./modules/reservation.js";

// --- Main Application Initialization ---
const initApp = async () => {
  try {
    // Wait for tours to load from API (or fallback)
    if (window.toursReady) await window.toursReady;

    // 1. Render Dynamic Content
    renderTours();

    // 1a. Load State
    loadFromLocalStorage();
    updateSelectedToursDisplay();
    updateAllButtons();

    // 1b. Set Date Input Min (Today)
    const dateInput = document.getElementById("date");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }

    // Mobile Menu
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navBar = document.querySelector("nav");

    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");
      });
      navLinks.addEventListener("click", (e) => {
        const target = e.target;
        if (target.tagName === "A" || target.closest("a")) {
          navLinks.classList.remove("active");
          menuToggle.classList.remove("active");
        }
      });
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (
          !navLinks.contains(target) &&
          !menuToggle.contains(target) &&
          navLinks.classList.contains("active")
        ) {
          navLinks.classList.remove("active");
          menuToggle.classList.remove("active");
        }
      });
    }

    // Unified Scroll Handler (consolidates navbar effect + scroll spy + scroll-up button)
    const scrollUpBtn = document.getElementById("scroll-up-btn");
    window.addEventListener("scroll", () => {
      // Navbar scroll effect
      if (navBar) {
        if (window.scrollY > 50) {
          navBar.classList.add("scrolled");
          navBar.style.background = "rgba(255, 255, 255, 0.98)";
          navBar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
        } else {
          navBar.classList.remove("scrolled");
          navBar.style.background = "rgba(255, 255, 255, 0.95)";
          navBar.style.boxShadow = "none";
        }
      }
      // Scroll spy
      updateActiveNavItem();
      // Scroll-up button visibility
      if (scrollUpBtn) {
        if (window.scrollY > 300) {
          scrollUpBtn.classList.add("show");
          scrollUpBtn.style.display = "block";
        } else {
          scrollUpBtn.classList.remove("show");
          scrollUpBtn.style.display = "none";
        }
      }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const href = this.getAttribute("href");
        if (!href) return;
        const targetHost = document.querySelector(href);
        if (targetHost) {
          document
            .querySelectorAll(".nav-links a")
            .forEach((Link) => Link.classList.remove("active"));
          this.classList.add("active");
          targetHost.scrollIntoView({ behavior: "smooth", block: "start" });
          if (navLinks) navLinks.classList.remove("active");
        }
      });
    });

    // --- Scroll Reveal Animation ---
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            entry.target.classList.add("active");
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(
        "section h2, .menu-item, .reveal, .reveal-on-scroll, form, .footer-content, .hero-content, .reveal-item, .reservation-content",
      )
      .forEach((el) => {
        if (!el.classList.contains("is-revealed")) {
          revealObserver.observe(el);
        }
      });

    if (scrollUpBtn) {
      scrollUpBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // --- Event Delegation ---
    document.body.addEventListener("click", (e) => {
      const target = e.target;

      // Select All Buttons
      if (target.matches(".select-all-btn")) {
        const category = target.getAttribute("data-category");
        if (category) toggleAllInSection(category, target);
      }

      // Add to Plan Buttons
      const addBtn = target.closest(".add-to-plan-btn");
      if (addBtn) {
        // Stop propagation so the card-click listener doesn't fire too
        e.stopPropagation();
        const tourId = addBtn.getAttribute("data-tour-id");

        if (tourId) toggleTour(addBtn, tourId);
        return;
      }

      // More Details Buttons
      const detailsBtn = target.closest(".details-btn");
      if (detailsBtn) {
        e.stopPropagation(); // Prevent card click
        const tourId = detailsBtn.getAttribute("data-tour-id");
        if (tourId) showTourDetails(tourId);
        return;
      }

      // Transport Checkbox (Label click bubbles, preventing double toggle handled by logic but safer to stop prop on change/click)
      if (
        target.closest(".transport-label") ||
        target.closest(".transport-checkbox")
      ) {
        e.stopPropagation();
        return;
      }

      // Image Click -> Carousel
      if (target.matches(".menu-item-image")) {
        e.stopPropagation();
        const tourId = target.getAttribute("data-tour-id");
        if (tourId && window.openCarousel) window.openCarousel(tourId);
        return;
      }

      // Click on Post (Card Body) to Toggle
      const menuItem = target.closest(".menu-item");
      if (menuItem) {
        const addBtnInner = menuItem.querySelector(".add-to-plan-btn");
        const tourId = addBtnInner?.getAttribute("data-tour-id");
        if (tourId) toggleTour(addBtnInner, tourId);
      }

      // Remove Buttons
      const removeBtn = target.closest(".tour-remove-btn");
      if (removeBtn) {
        const tourId = removeBtn.getAttribute("data-tour-id");
        if (tourId) removeTourById(tourId);
      }

      if (target.matches("#clear-all-btn")) showConfirmationModal();

      if (target.closest(".close") || target.matches("#cancel-clear")) {
        closeModal();
        closeConfirmationModal();
      }

      if (target.matches("#confirm-clear")) confirmClearAll();

      if (target.matches(".modal")) {
        closeModal();
        closeConfirmationModal();
      }

      const guestBtn = target.closest(".guest-btn");
      if (guestBtn) {
        if (guestBtn.classList.contains("minus"))
          updateGuestCount(-1, guestBtn);
        if (guestBtn.classList.contains("plus")) updateGuestCount(1, guestBtn);
      }
    });

    document.body.addEventListener("change", (e) => {
      const target = e.target;
      if (target.matches(".transport-checkbox")) {
        const tourId = target.getAttribute("data-tour-id");
        if (tourId) toggleTransport(target, tourId);
      }
      if (target.id === "guests") {
        updateGuestCount(0); // Trigger update
      }
    });

    const form = document.querySelector(".reservation-form");
    if (form) form.addEventListener("submit", handleReservation);

    updateActiveNavItem();
  } catch (err) {
    console.error("initApp error:", err);
  }
};

const initializeAll = () => {
  initApp();
  initCarousel();
  initCustomTimeDropdown();
  initReviews();
  initPhoneInput();
  initFAQ();

  // Initialize input focus optimization
  import("./modules/ui.js").then((module) => {
    if (module.initInputFocus) module.initInputFocus();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAll);
} else {
  initializeAll();
}
