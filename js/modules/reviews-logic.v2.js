// Reviews Logic — Auto-scrolling Review Cards with Accordion
// Access UMD Globals
const { REVIEWS } = window;

// --- Reviews Logic (Hybrid: Auto + Manual) ---
import { escapeHTML } from "./ui.js";

export function initReviews() {
  const container = document.querySelector(".reviews-container");
  const track = document.getElementById("reviews-track");
  if (!container || !track) return;

  const reviews = REVIEWS || [];
  if (reviews.length === 0) {
    track.innerHTML = "<p style='text-align:center;width:100%'>No reviews.</p>";
    return;
  }

  // Helper: Create Card HTML String
  function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card";
    const starsHtml = "★".repeat(review.stars) + "☆".repeat(5 - review.stars);

    const safeText = escapeHTML(review.text);
    const safeName = escapeHTML(review.name);

    // Recalculate display text based on safe text to avoid breaking HTML entities
    const maxLength = 180;
    const isLong = safeText.length > maxLength;
    const displayText = isLong ? safeText.substring(0, maxLength) : safeText;

    // Use data attributes to store text for easy toggling
    card.innerHTML = `
      <div class="review-stars">${starsHtml}</div>
      <p class="review-text" data-full-text="${safeText}" data-truncated-text="${displayText}">
        "${displayText}${isLong ? "..." : ""}"
      </p>
      ${isLong ? `<span class="see-more-btn">Read More</span>` : ""}
      <div class="review-footer">
        <span class="review-author">${safeName}</span>
        <span class="review-platform">
          <img src="img/google-maps-icon.svg" alt="Google Maps" class="google-maps-pin">
          Review from Google Maps
        </span>
      </div>
    `;

    // Hover Spotlight Logic
    card.addEventListener("mouseenter", () => track.classList.add("has-hover"));
    card.addEventListener("mouseleave", () =>
      track.classList.remove("has-hover"),
    );

    return card;
  }

  // Shuffle Logic
  const shuffledReviews = [...reviews].sort(() => Math.random() - 0.5);

  // Populate Track
  const allReviews = [
    ...shuffledReviews,
    ...shuffledReviews,
    ...shuffledReviews,
  ];
  track.innerHTML = "";
  allReviews.forEach((review) => {
    track.appendChild(createReviewCard(review));
  });

  // --- EVENT DELEGATION FOR ACCORDION LOGIC ---
  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".see-more-btn");
    const textClick = e.target.closest(".review-text");

    if (!btn && !textClick) return;

    e.stopPropagation();

    const target = btn || textClick;
    const card = target.closest(".review-card");

    if (!card) return;

    if (
      !card.querySelector(".see-more-btn") &&
      !card.classList.contains("expanded")
    )
      return;

    const isExpanded = card.classList.contains("expanded");

    if (isExpanded) {
      collapseCard(card);
      track.classList.remove("has-expanded");
    } else {
      const allExpanded = track.querySelectorAll(".review-card.expanded");
      allExpanded.forEach((otherCard) => {
        if (otherCard !== card) {
          collapseCard(otherCard);
        }
      });

      expandCard(card);
      track.classList.add("has-expanded");
    }
  });

  function collapseCard(card) {
    const textEl = card.querySelector(".review-text");
    const btn = card.querySelector(".see-more-btn");
    const truncatedText = textEl.dataset.truncatedText;

    card.classList.remove("expanded");
    textEl.innerHTML = `"${truncatedText}..."`;
    if (btn) btn.innerHTML = "Read More";
  }

  function expandCard(card) {
    const textEl = card.querySelector(".review-text");
    const btn = card.querySelector(".see-more-btn");
    const fullText = textEl.dataset.fullText;

    card.classList.add("expanded");
    textEl.innerHTML = `"${fullText}"`;
    if (btn) btn.innerHTML = "Show Less";
  }

  // --- Auto Scroll Logic ---
  let scrollAmount = 0;
  const speed = 0.4; // Slower, more premium glide
  let isPaused = false;
  let animationId;

  function getSingleSetWidth() {
    return track.scrollWidth / 3;
  }

  function autoScroll() {
    if (!isPaused) {
      scrollAmount += speed;
      const singleSetWidth = getSingleSetWidth();
      if (scrollAmount >= singleSetWidth) {
        scrollAmount = 0;
        container.scrollLeft = 0;
      } else {
        container.scrollLeft = scrollAmount;
      }
    } else {
      scrollAmount = container.scrollLeft;
    }
    animationId = requestAnimationFrame(autoScroll);
  }

  animationId = requestAnimationFrame(autoScroll);

  // Interaction Handlers
  container.addEventListener("mouseenter", () => (isPaused = true));
  container.addEventListener("mouseleave", () => (isPaused = false));
  container.addEventListener("touchstart", () => (isPaused = true), {
    passive: true,
  });
  container.addEventListener("touchend", () => {
    setTimeout(() => (isPaused = false), 1000);
  });
}
