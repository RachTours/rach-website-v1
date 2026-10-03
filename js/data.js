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
    images: ["img/small-desert.jpg", "img/dunes.png", "img/pic7.jpg"],
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
    images: ["img/dunes.png", "img/pic4.jpg"],
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
    images: ["img/dunes.png", "img/pic7.jpg"],
    details: [
      "Duration: 1 Hours",
      "Ride through dunes and beach",
      "Safety equipment provided",
      "Briefing for beginners",
    ],
  },
 
 
  "airport-transfer": {
    title: "Airport Transfer",
    subtitle: "Stress-free private transport",
    category: "Local Tours & Experiences",
    price: 40,
    hideTransport: true,
    images: ["img/airport.png", "img/pic2.jpg", "img/pic6.jpg","https://www.bing.com/images/search?view=detailV2&ccid=kO8MeGEn&id=21763067310EC4115310C50E57B0A1032F21C55E&thid=OIP.kO8MeGEnIDkbiBcZj-91MAHaFF&mediaurl=https%3A%2F%2Ftaxi-dubai.ae%2Fwp-content%2Fuploads%2F2020%2F01%2F11-768x528.jpg&q=airport+transfers&ck=B59D5B0AEAD384D71937CE3457A908E7&expw=768&exph=528&form=rc2idp&cit=ccid_DbQcJJZU*cp_259E91C1DA1CE0F358DADBF509645009*mid_C585A44725D51EC431512E0CF91E59B0FD45A78F*thid_OIP.DbQcJJZUIPDutXiDAiecSwHaE8&selectedindex=0&cdnurl=https%3A%2F%2Fth.bing.com%2Fth%2Fid%2FR.90ef0c78612720391b8817198fef7530%3Frik%3DXsUhLwOhsFcOxQ%26pid%3DImgRaw%26r%3D0&vt=2&sim=11"],
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
    images: ["img/dunes.png", "img/pic7.jpg"],
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
    images: ["img/horse-ride.png", "img/pic1.jpg"],
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
    images: ["img/dunes.png", "img/pic7.jpg"],
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
