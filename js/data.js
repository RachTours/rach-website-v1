// Data Configuration - CMS-Like Structure
// =========================================================================
// HOW TO ADD A NEW TOUR:
// 1. Copy an existing tour block (curly braces to curly braces).
// 2. Paste it into the TOURS object below.
// 3. Give it a unique ID (e.g., "my-new-tour": { ... }).
// 4. Update the title, subtitle, price, and details.
// 5. Add images to the 'img/' folder and reference them in the 'images' array.
// 6. Optionally add 'link' string for external booking references.
// =========================================================================

const TRANSPORT_FEE = 0; // dont change it

const TOURS = {
  // === LOCAL TOURS & EXPERIENCES ===
 
 
  "small-desert": {
    title: "Small Desert Trip",
    subtitle: "Journey to the edge of the desert",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 30,
    images: ["img/post1-1.webp", "img/post1-2.webp", "img/post1-3.webp" , "img/post1-4.webp"],
    details: [
      "Duration: 5-6 Hours",
      "Pick up: Any time",
      "Explore sand dunes and Berber villages",
      "Traditional Moroccan tea break (optional)",
    ],
  },
  
 
  "buggy-tour": {
    title: "Buggy Tour",
    subtitle: "Thrilling dune-driving experience",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 65,
    images: ["img/post2-1.webp", "img/post2-2.webp", "img/post2-3.webp"],
    details: [
      "Duration: 1 Hours (driving)",
      "Safety briefing and gear included",
      "Tea break (optinal)",
    ],
  },
  "sunset-tea": {
    title: "Sunset Tea",
    subtitle: "Enjoy a peaceful sunset tea timlalin dunes experience",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 15,
    images: [ "img/post4-1.webp", "img/post4-2.webp", "img/post4-3.webp", "img/post4-4.webp", "img/post4-5.webp"],
    details: [
      "Duration: 1 Hours (driving)",
      "Safety briefing and gear included",
      "Tea break (optinal)",
    ],
  },
  "quad-bike": {
    title: "Quad Bike Tour in the Sand",
    subtitle: "High-energy desert exploration",
    hideTransport: false,
    category: "Local Tours & Experiences",
    price: 30,
    images: ["img/post3-1.webp", "img/post3-2.webp", "img/post3-3.webp", "img/post3-4.webp", "img/post3-5.webp"],
    details: [
      "Duration: 2–3 Hours",
      "relaxing Sunset Tea session",
      "watching the sun disappear into the Atlantic Ocean",
      "enjoy traditional Moroccan tea",
    ],
  },
 "sunset-tea": {
    title: "Sunset Tea",
    subtitle: "Enjoy a peaceful sunset tea timlalin dunes experience",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 15,
    images: [ "img/post4-1.webp", "img/post4-2.webp", "img/post4-3.webp", "img/post4-4.webp", "img/post4-5.webp"],
    details: [
      "Duration: 1 Hours (driving)",
      "Safety briefing and gear included",
      "Tea break (optinal)",
    ],
  },
 
  "airport-transfer": {
    title: "Airport Transfer",
    subtitle: "Stress-free private transport",
    category: "Local Tours & Experiences",
    price: 40,
    hideTransport: true,
    images: ["img/airport.png"],
    details: [
      "Private comfortable vehicle",
      "Professional driver",
      "Meet and greet service at airport",
      "Available 24/7",
      "Fixed price, no hidden fees",
    ],
  },

  // === DAY TRIPS & EXCURSIONS ===
  
  "sahara-dunes": {
    title: "Sahara Dunes Trip",
    subtitle: "Agadir's mini Sahara experience",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 25,
    images: [ "img/post5-1.webp", "img/post5-2.webp", "img/post5-3.webp", "img/post5-4.webp"],
    details: [
      "Full day adventure",
      "Explore massive sand dunes",
      "Scenic drive through Anti-Atlas mountains",
    ],
  },
  
  "camel-ride": {
    title: "Camel Ride Tour",
    subtitle: "Traditional Moroccan beach riding",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 25,
    images: [ "img/post6-1.webp", "img/post6-2.webp", "img/post6-3.webp", "img/post6-4.webp"],
    details: [
      "1 Hours riding experience",
      "Flamingo spotting (seasonally)",
      "Pick up and drop off included",
    ],
  },
  sandboarding: {
    title: "Sandboarding",
    subtitle: "Thrilling dune-surfing fun",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 25,
    images: [ "img/post7-1.webp", "img/post7-2.webp", "img/post7-3.webp", "img/post7-4.webp"],
    details: [
      "Combine with half-day desert trip",
      "Boards provided",
      "Slide down the steep dunes",
      "panoramic view",
      "Fun for all ages",
    ],
  },
 

  // === UNIQUE ATTRACTIONS ===
 

};

// Direct Export — hardcoded data only, no API
if (typeof window !== "undefined") {
  window.TRANSPORT_FEE = TRANSPORT_FEE;
  window.TOURS = TOURS;

  // Resolve immediately — no async fetch needed
  window.toursReady = Promise.resolve();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TOURS, TRANSPORT_FEE };
}
