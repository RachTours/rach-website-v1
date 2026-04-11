/**
 * Admin Authentication Middleware
 * Validates JWT token from HttpOnly cookie or Authorization header.
 * Also checks in-memory token blacklist for revoked tokens.
 */
const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("../controllers/authController");

// SECURITY: No fallback secret — server.js enforces JWT_SECRET exists at startup
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  // 1. Check for token in Authorization header first (mobile clients)
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Fallback to HttpOnly cookie (web clients)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Missing token" });
  }

  // 3. Check if token has been revoked
  if (tokenBlacklist.has(token)) {
    return res
      .status(403)
      .json({ success: false, message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token expired. Please refresh or login again.",
        });
    }
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid token" });
  }
};
