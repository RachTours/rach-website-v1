const fs = require("fs"); // Added for logging

// --- CRASH LOGGING (Moved to top) ---
const logCrash = (err) => {
  const msg = `[${new Date().toISOString()}] CRASH: ${err.message}\nStack: ${err.stack}\n\n`;
  try {
    fs.appendFileSync("crash.log", msg);
  } catch (e) {}
  console.error(msg);
};
process.on("uncaughtException", (err) => {
  logCrash(err);
  process.exit(1); // Node.js best practice: exit after uncaught exception
});
process.on("unhandledRejection", logCrash);

const express = require("express");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const { initDatabase, testConnection, pool } = require("./src/config/database");

const app = express(); // Initialize Express App

// --- 1. Configuration & Constants ---
const PORT = process.env.PORT || 3005;

// Warn if essential variables are missing
const requiredEnv = ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID", "MY_PHONE_NUMBER"];
requiredEnv.forEach((key) => {
  if (!process.env[key] || process.env[key].includes("YOUR_")) {
    console.warn(
      `WARNING: ${key} is not set or is a placeholder. WhatsApp messages will use MOCK MODE.`,
    );
  }
});

if (!process.env.ADMIN_API_TOKEN) {
  console.error(
    "FATAL: ADMIN_API_TOKEN is not set. Admin login will not work.",
  );
  process.exit(1);
}

// Fail fast if JWT secrets are missing — NEVER use fallback secrets
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("change-me")) {
  console.error(
    "FATAL: JWT_SECRET is not set or is a placeholder. Set a strong random secret in .env!",
  );
  process.exit(1);
}
if (
  !process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_REFRESH_SECRET.includes("change-me")
) {
  console.error(
    "FATAL: JWT_REFRESH_SECRET is not set or is a placeholder. Set a strong random secret in .env!",
  );
  process.exit(1);
}

// --- Security Middleware ---

// 1a. Force HTTPS (Production Only) with Open Redirect Protection
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (req.headers["x-forwarded-proto"] !== "https") {
      const safeHost = process.env.DOMAIN || "rach-tours.com";
      try {
        const redirectUrl = new URL(req.url, `https://${safeHost}`);
        return res.redirect(redirectUrl.toString());
      } catch (e) {
        return res.redirect(`https://${safeHost}`);
      }
    }
  }
  next();
});

// 1. Helmet (Secure Headers & CSP)
const isProduction = process.env.NODE_ENV === "production";

// Request Logging (development only — use a log aggregator like PM2 logs in production)
if (!isProduction) {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} (${req.ip})`,
    );
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: isProduction
          ? ["'self'", "'unsafe-inline'"]
          : ["'self'", "'unsafe-inline'", "https:", "http:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        fontSrc: ["'self'", "https:", "data:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: isProduction
          ? ["'self'", "https:"]
          : ["'self'", "https:", "http:"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 1000, // Relaxed for local dev
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 3. CORS Configuration
const allowedOrigins = ["https://rach-tours.com", "https://www.rach-tours.com"];
if (!isProduction) {
  allowedOrigins.push(
    "http://localhost:3005",
    "http://localhost:3000",
    "http://127.0.0.1:3005",
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin — required for mobile apps (Flutter),
      // server-to-server calls, and curl. This is intentional and safe because
      // CORS is a browser-only mechanism; non-browser clients bypass it anyway.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 4. Block Sensitive Files — use normalized paths and exact basename matching
app.use((req, res, next) => {
  const sensitiveFiles = new Set([
    ".env",
    ".env.example",
    "server.js",
    "package.json",
    "package-lock.json",
    "README.md",
    "Procfile",
    ".gitignore",
    "check_db.js",
    "crash.log",
  ]);
  const sensitiveDirs = [
    "/src",
    "/.git",
    "/.vscode",
    "/node_modules",
    "/.agent",
    "/rach_admin",
  ];

  // Normalize: decode URI, resolve path traversals
  const decodedPath = decodeURIComponent(req.path);
  const normalizedPath = path.normalize(decodedPath).replace(/\\/g, "/");
  const basename = path.basename(normalizedPath);

  if (
    sensitiveFiles.has(basename) ||
    sensitiveDirs.some((dir) => normalizedPath.startsWith(dir))
  ) {
    return res.status(403).send("Access Denied");
  }
  next();
});

app.use(compression());
// Serve only public asset directories — NOT the entire project root
const staticOpts = {
  maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
  immutable: process.env.NODE_ENV === "production",
};
app.use("/css", express.static(path.join(__dirname, "css"), staticOpts));
app.use("/js", express.static(path.join(__dirname, "js"), staticOpts));
app.use("/assets", express.static(path.join(__dirname, "assets"), staticOpts));
app.use("/img", express.static(path.join(__dirname, "img"), staticOpts));
// Serve individual root files
app.get("/manifest.json", (req, res) =>
  res.sendFile(path.join(__dirname, "manifest.json")),
);
app.get("/robots.txt", (req, res) =>
  res.sendFile(path.join(__dirname, "robots.txt")),
);
app.get("/sitemap.xml", (req, res) =>
  res.sendFile(path.join(__dirname, "sitemap.xml")),
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
// NOTE: xss-clean was removed (deprecated, unmaintained since 2019, known CVEs).
// XSS protection is handled by: Helmet CSP headers + express-validator sanitization.
app.use(hpp());

// Auth rate limiting is handled inside src/routes/auth.js

// --- Routes ---

// Health Check (for mobile app connection testing)
app.get("/api/health", async (req, res) => {
  const dbOk = pool ? await testConnection(1, 0).catch(() => false) : false;
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbOk ? "connected" : "disconnected",
    version: "3.3.0",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api", require("./src/routes/api"));
app.use("/api/admin", require("./src/routes/admin"));

// Catch-all: serve index.html for SPA-like routing
// NOTE: Sensitive file blocking is already handled by the middleware above (lines 153-187).
// No need to duplicate it here.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  const message = isProduction
    ? "Internal server error"
    : `Internal server error: ${err.message}`;
  const payload = { success: false, message };
  if (!isProduction) payload.error = err.message;
  res.status(500).json(payload);
});

// --- Server Activation ---
const serverPort = process.env.PORT || 3005;
app.listen(serverPort, async () => {
  console.log(`🚀 Server is running on port ${serverPort}`);
  console.log(`   Environment: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
  await initDatabase();
});

// Export for Passenger compatibility
module.exports = app;
