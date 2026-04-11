const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// SECURITY: No fallback secrets — server.js enforces these exist at startup
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// In-memory token blacklist with TTL cleanup (use Redis in production at scale)
// NOTE: This is cleared on server restart. For critical systems, persist to DB/Redis.
// Stores { token → expiryTimestamp } and sweeps expired entries every hour.
const tokenBlacklist = new Map();
setInterval(
  () => {
    const now = Date.now();
    for (const [token, expiry] of tokenBlacklist) {
      if (now > expiry) tokenBlacklist.delete(token);
    }
  },
  60 * 60 * 1000,
); // Sweep every hour

/**
 * Constant-time password comparison to prevent timing attacks.
 * Returns true if passwords match, false otherwise.
 */
function safeCompare(input, secret) {
  if (!input || !secret) return false;
  const inputBuf = Buffer.from(String(input));
  const secretBuf = Buffer.from(String(secret));
  if (inputBuf.length !== secretBuf.length) {
    // Still perform comparison to avoid leaking length info via timing
    crypto.timingSafeEqual(Buffer.alloc(secretBuf.length), secretBuf);
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, secretBuf);
}

exports.login = (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  // Validate against admin token using constant-time comparison
  if (!safeCompare(password, process.env.ADMIN_API_TOKEN)) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Issue Access Token (short-lived) with unique ID for revocation tracking
  const jti = crypto.randomUUID();
  const accessToken = jwt.sign({ role: "admin", jti }, JWT_SECRET, {
    expiresIn: "1h",
  });

  // Issue Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    { role: "admin", type: "refresh" },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // Set HttpOnly cookie for web clients
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
  });

  // Return tokens in body for mobile clients (Flutter)
  return res.json({
    success: true,
    message: "Logged in successfully",
    token: accessToken,
    refreshToken: refreshToken,
    expiresIn: 3600, // seconds
  });
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token required" });
  }

  if (tokenBlacklist.has(refreshToken)) {
    return res
      .status(403)
      .json({ success: false, message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return res
        .status(403)
        .json({ success: false, message: "Invalid token type" });
    }

    // Issue new access token with unique ID
    const newJti = crypto.randomUUID();
    const newAccessToken = jwt.sign(
      { role: "admin", jti: newJti },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // Set new cookie
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.json({
      success: true,
      token: newAccessToken,
      expiresIn: 3600,
    });
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

exports.logout = (req, res) => {
  // Blacklist the refresh token if provided (TTL = 7 days, matching refresh token expiry)
  const { refreshToken } = req.body;
  if (refreshToken) {
    tokenBlacklist.set(refreshToken, Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
};

// Export for use by middleware
exports.tokenBlacklist = tokenBlacklist;
