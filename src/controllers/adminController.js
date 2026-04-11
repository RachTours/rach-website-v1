const { pool } = require("../config/database");

// Helper: return 503 if DB is not available
function requireDB(res) {
  if (!pool) {
    res.status(503).json({
      success: false,
      message: "Database not available. Run: npm install mysql2",
    });
    return false;
  }
  return true;
}

// Helper: validate :id param is a positive integer
function validateId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Invalid reservation ID. Must be a positive integer.",
    });
    return null;
  }
  return id;
}

/**
 * GET /api/admin/stats
 * Dashboard statistics — works with any table schema
 */
exports.getStats = async (req, res) => {
  if (!requireDB(res)) return;
  try {
    // First, check which columns actually exist in the table
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations'`,
    );
    const colNames = columns.map((c) => c.COLUMN_NAME);

    // Guest count: same logic as reservation_detail_screen (people ?? guests ?? 1)
    const hasPeople = colNames.includes("people");
    const hasGuests = colNames.includes("guests");
    const guestExpr =
      hasPeople && hasGuests
        ? "COALESCE(people, guests, 1)"
        : hasGuests
          ? "COALESCE(guests, 1)"
          : hasPeople
            ? "COALESCE(people, 1)"
            : "0";

    const hasStatus = colNames.includes("status");
    const hasTotalPrice = colNames.includes("total_price");

    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) as totalBookings,
        ${guestExpr !== "0" ? `COALESCE(SUM(${guestExpr}), 0)` : "0"} as totalGuests,
        ${hasTotalPrice ? "COALESCE(SUM(CASE WHEN status = 'successful' THEN total_price ELSE 0 END), 0)" : "0"} as totalRevenue,
        ${hasStatus ? "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)" : "0"} as pendingCount,
        ${hasStatus ? "SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)" : "0"} as confirmedCount,
        ${hasStatus ? "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)" : "0"} as cancelledCount,
        ${hasStatus ? "SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END)" : "0"} as successfulCount,
        ${hasStatus && guestExpr !== "0" ? `SUM(CASE WHEN status = 'pending' THEN ${guestExpr} ELSE 0 END)` : "0"} as pendingGuests,
        ${hasStatus && guestExpr !== "0" ? `SUM(CASE WHEN status = 'confirmed' THEN ${guestExpr} ELSE 0 END)` : "0"} as confirmedGuests,
        ${hasStatus && guestExpr !== "0" ? `SUM(CASE WHEN status = 'cancelled' THEN ${guestExpr} ELSE 0 END)` : "0"} as cancelledGuests,
        ${hasStatus && guestExpr !== "0" ? `SUM(CASE WHEN status = 'successful' THEN ${guestExpr} ELSE 0 END)` : "0"} as successfulGuests
      FROM reservations
    `);

    // Ensure all values are numbers (not BigInt or null)
    const data = rows[0];
    const safeData = {
      totalBookings: Number(data.totalBookings || 0),
      totalGuests: Number(data.totalGuests || 0),
      totalRevenue: Number(data.totalRevenue || 0),
      pendingCount: Number(data.pendingCount || 0),
      confirmedCount: Number(data.confirmedCount || 0),
      cancelledCount: Number(data.cancelledCount || 0),
      successfulCount: Number(data.successfulCount || 0),
      pendingGuests: Number(data.pendingGuests || 0),
      confirmedGuests: Number(data.confirmedGuests || 0),
      cancelledGuests: Number(data.cancelledGuests || 0),
      successfulGuests: Number(data.successfulGuests || 0),
    };

    return res.json({ success: true, data: safeData });
  } catch (err) {
    console.error("Stats error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

/**
 * GET /api/admin/reservations
 * List all reservations with optional filters
 * Query params: ?status=pending&search=john&limit=50&offset=0
 */
exports.getReservations = async (req, res) => {
  if (!requireDB(res)) return;
  try {
    const { status, search } = req.query;
    // Clamp limit/offset to safe ranges to prevent abuse
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    let query = "SELECT * FROM reservations WHERE 1=1";
    const params = [];

    if (
      status &&
      ["pending", "confirmed", "cancelled", "successful"].includes(status)
    ) {
      query += " AND status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (name LIKE ? OR phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("List error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reservations" });
  }
};

/**
 * GET /api/admin/reservations/:id
 * Get a single reservation by ID
 */
exports.getReservation = async (req, res) => {
  if (!requireDB(res)) return;
  const id = validateId(req, res);
  if (id === null) return;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM reservations WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Get error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reservation" });
  }
};

/**
 * PUT /api/admin/reservations/:id
 * Update reservation status (confirm / cancel)
 */
exports.updateReservation = async (req, res) => {
  if (!requireDB(res)) return;
  const id = validateId(req, res);
  if (id === null) return;
  try {
    const { status } = req.body;
    if (
      !status ||
      !["pending", "confirmed", "cancelled", "successful"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use: pending, confirmed, cancelled, successful",
      });
    }

    const [result] = await pool.execute(
      "UPDATE reservations SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    return res.json({ success: true, message: `Reservation ${status}` });
  } catch (err) {
    console.error("Update error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update reservation" });
  }
};

/**
 * DELETE /api/admin/reservations/:id
 * Delete a reservation
 */
exports.deleteReservation = async (req, res) => {
  if (!requireDB(res)) return;
  const id = validateId(req, res);
  if (id === null) return;
  try {
    const [result] = await pool.execute(
      "DELETE FROM reservations WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    return res.json({ success: true, message: "Reservation deleted" });
  } catch (err) {
    console.error("Delete error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete reservation" });
  }
};
