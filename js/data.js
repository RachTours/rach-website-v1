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
 
  "souk-tour": {
    title: "Agadir Souk El Had Tour",
    subtitle: "Experience Agadir's largest market",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 15,
    images: ["img/souk.png", "https://github.com/RachTours/rach-website-v1/blob/main/img/airport.png?raw=true","img/pic4.jpg", "img/pic6.jpg", "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1Iz5XP.img"],
    details: [
      "Duration: 1-4 Hours",
      "Pick up: Any time",
      "Free time to explore the market independently",
      "Discover spices, crafts, and local culture",
    ],
  },
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
  "horse-riding": {
    title: "Horse Riding",
    subtitle: "Sunset beach riding adventure",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 20,
    images: ["img/horse-ride.png", "img/pic1.jpg"],
    details: [
      "Duration: 2 Hours",
      "Ride along the beach and tamri village river",
      "Suitable for all skill levels",
      "Equipment and guide included",
      "Beautiful sunset option available",
    ],
  },
  "old-medina": {
    title: "Visit Old Medina of Agadir",
    subtitle: "The historic heart of Agadir",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 20,
    images: ["img/souk.png", "img/pic6.jpg"],
    details: [
      "Duration: 2-3 Hours",
      "Admire traditional masonry and architecture",
      "Visit artisan workshops",
      "Great photo opportunities",
      "Entrance fee included",
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
  "hammam-massage": {
    title: "Moroccan Hammam & Massage (2h)",
    subtitle: "Authentic relaxation ritual",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 40,
    images: ["img/pic3.jpg", "img/pic2.jpg"],
    details: [
      "1 Hour Traditional Hammam (Scrub)",
      "1 Hour Relaxing Massage with Argan Oil",
      "Towels and slippers provided",
      "Ultimate relaxation experience",
    ],
  },
  "cooking-class": {
    title: "Cooking Class",
    subtitle: "Learn the secrets of Moroccan cuisine",
    category: "Local Tours & Experiences",
    hideTransport: false,
    price: 40,
    images: ["img/cooking.png", "img/pic6.jpg"],
    details: [
      "Duration: 4 Hours",
      "Market visit for ingredients",
      "Learn to cook Tagine or Couscous",
      "Enjoy your meal afterwards",
    ],
  },
  "airport-transfer": {
    title: "Airport Transfer",
    subtitle: "Stress-free private transport",
    category: "Local Tours & Experiences",
    price: 40,
    hideTransport: false,
    images: ["img/airport.png", "img/pic2.jpg", "img/pic6.jpg"],
    details: [
      "Private comfortable vehicle",
      "Professional driver",
      "Meet and greet service at airport",
      "Available 24/7",
      "Fixed price, no hidden fees",
    ],
  },

  // === DAY TRIPS & EXCURSIONS ===
  "taroudant-trip": {
    title: "Taroudant Trip",
    subtitle: "Discover the Little Marrakech",
    category: "Day Trips & Excursions",
    price: 50,
    hideTransport: false,
    images: ["img/souk.png", "img/pic4.jpg"],
    details: [
      "Duration: Half Day or Full Day",
      'Explore the "Little Marrakech"',
      "Visit ancient ramparts and souks",
      "See the Tiout Oasis",
      "Hotel pickup included",
    ],
  },
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
  "paradise-valley": {
    title: "Paradise Valley Trip",
    subtitle: "Agadir's natural oasis adventure",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 20,
    images: ["img/pic1.jpg", "img/pic2.jpg"],
    details: [
      "Half day trip",
      "Short hike through palm groves",
      "Swimming in natural rock pools",
      "Stunning photography spots",
    ],
  },
  "souss-park": {
    title: "Souss National Park Trip",
    subtitle: "Wildlife and birdwatching tour",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 45,
    images: ["img/pic1.jpg", "img/pic4.jpg"],
    details: [
      "Guided nature walk",
      "Spot migratory birds including flamingos",
      "Visit the museum of the park",
      "Ideal for nature lovers",
      "Morning tour recommended",
    ],
  },
  "city-tour": {
    title: "City Tour from Agadir & Taghazout",
    subtitle: "The complete city overview",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 25,
    images: ["img/souk.png", "img/pic6.jpg"],
    details: [
      "Duration: 3 Hours",
      "Visit Kasbah Oufella (Historic Fortress)",
      "Drive through Marina and City Center",
    ],
  },
  "boat-trip": {
    title: "Boat Trip",
    subtitle: "Relaxing cruise on the Atlantic",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 45,
    images: ["img/pic5.jpg", "img/pic4.jpg"],
    details: ["30 min - 1 h", "Swimming break", "Relaxing atmosphere"],
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
  telepherique: {
    title: "Telepherique",
    subtitle: "Modern cable car city views",
    category: "Day Trips & Excursions",
    hideTransport: false,
    price: 25,
    images: ["img/pic2.jpg", "img/pic1.jpg"],
    details: [
      "Ride to the historic Kasbah Oufella",
      "Panoramic views of the city and bay",
      "Modern comfortable cabins",
      "Driver waits for return trip",
      "Ticket included",
    ],
  },

  // === UNIQUE ATTRACTIONS ===
  crocoparc: {
    title: "Crocoparc Tour",
    subtitle: "Family fun with 300+ crocodiles",
    category: "Unique Attractions",
    hideTransport: false,
    price: 25,
    images: ["img/pic1.jpg", "img/pic4.jpg"],
    details: [
      "Entrance ticket included",
      "Walk through thematic botanical gardens",
      "Watch crocodile feeding times",
      "Educational and fun",
      "Great for families",
    ],
  },
  "dolphin-show": {
    title: "Dolphin",
    subtitle: "Spectacular marine performances",
    category: "Unique Attractions",
    hideTransport: false,
    price: 30,
    images: ["img/pic5.jpg", "img/pic4.jpg"],
    details: [
      "Show times vary (usually afternoon)",
      "Watch dolphins and sea lions perform",
      "Photo opportunities available",
    ],
  },
  "goats-tree": {
    title: "Goats on the Tree Tour",
    subtitle: "The famous Moroccan viral phenomenon",
    category: "Unique Attractions",
    hideTransport: false,
    price: 20,
    images: ["img/pic1.jpg", "img/pic6.jpg"],
    details: [
      "Short trip or included in Essaouira/Marrakech trips",
      "See goats climbing Argan trees",
      "Unique to this region of Morocco",
      "Photo stop",
      "Visit Argan cooperative",
    ],
  },
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
