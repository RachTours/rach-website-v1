const { validationResult } = require("express-validator");
const axios = require("axios");
const {
  unescapeHTMLEntities,
  escapeSequencesToLiteral,
} = require("../utils/stringUtils");
const { pool } = require("../config/database");

const { TOURS, TRANSPORT_FEE } = require("../../js/data.js");

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MY_PHONE_NUMBER = process.env.MY_PHONE_NUMBER;

/**
 * Check if an env switch is enabled (defaults to true if not set)
 */
function isEnabled(envVar) {
  if (!envVar) return true; // Default: enabled
  return envVar.toLowerCase() !== "false";
}

/**
 * POST /api/send-whatsapp
 * Creates a reservation, saves to DB, then fires notifications (non-blocking).
 */
exports.createReservation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: errors.array(),
    });
  }

  try {
    const { name, phone, date, time, guests, special, selectedTours, clientCreatedAt } =
      req.body;

    // Strict Type Validation
    if (!Array.isArray(selectedTours)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tours data" });
    }

    if (selectedTours.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No tours selected." });
    }

    const safeGuests =
      typeof guests === "string"
        ? parseInt(guests, 10)
        : typeof guests === "number"
          ? guests
          : 1;
    const safeName = typeof name === "string" ? name : String(name || "");
    const safePhone = typeof phone === "string" ? phone : String(phone || "");
    const safeDate = typeof date === "string" ? date : String(date || "");
    const safeTime = typeof time === "string" ? time : String(time || "");
    let safeSpecial = special && typeof special === "string" ? special : "";

    // --- Build tour details ---
    let anyTransport = false;
    let tourDetailsText = "";
    let totalReservationPrice = 0;
    const groups = {};
    const enrichedTours = [];

    for (const item of selectedTours) {
      const tourId = item.tourId;
      const tour = TOURS[tourId];
      if (!tour) continue; // Skip unknown tour IDs silently

      const hasTransport = item.hasTransport === true;
      const basePrice = tour.price;
      const singlePersonPrice = basePrice + (hasTransport ? TRANSPORT_FEE : 0);
      const itemTotal = singlePersonPrice * safeGuests;

      if (hasTransport) anyTransport = true;

      if (!groups[tour.category]) groups[tour.category] = [];
      groups[tour.category].push({
        title: tour.title,
        hasTransport,
        itemTotal,
      });

      enrichedTours.push({
        tourId,
        title: tour.title,
        category: tour.category,
        pricePerPerson: singlePersonPrice,
        basePrice,
        hasTransport,
        transportFee: hasTransport ? TRANSPORT_FEE : 0,
        guests: safeGuests,
        totalPrice: itemTotal,
      });

      totalReservationPrice += itemTotal;
    }

    if (enrichedTours.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid tours found." });
    }

    for (const [category, items] of Object.entries(groups)) {
      const sectionTotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
      tourDetailsText += `*${category}* (Total: $${sectionTotal}):\n`;
      items.forEach((item) => {
        const transportSuffix = item.hasTransport ? " [🚕+Transport]" : "";
        tourDetailsText += `  • ${item.title} ($${item.itemTotal})${transportSuffix}\n`;
      });
    }

    if (tourDetailsText.length > 1000) {
      tourDetailsText = tourDetailsText.substring(0, 1000);
    }

    if (safeSpecial) safeSpecial = unescapeHTMLEntities(safeSpecial);
    if (safeSpecial && safeSpecial.length > 200)
      safeSpecial = safeSpecial.substring(0, 200);
    if (safeSpecial) safeSpecial = escapeSequencesToLiteral(safeSpecial);

    const transportLine = anyTransport
      ? "🚕 *Transport Requested* :✅ Yes"
      : "";
    const transportLineConfirm = anyTransport
      ? "|🚕 *Transport Requested*|\n Send us your location to get the most relevant transport service."
      : "";

    // --- Build WhatsApp messages ---
    let cleanPhone = safePhone.replace(/\D/g, "");
    const businessPhone = MY_PHONE_NUMBER || "212659727363";
    const cleanBusinessPhone = businessPhone.replace(/\D/g, "");

    const reconfirmText = `✅ Reservation Confirmed :\n👤 *${safeName}*\n📞 *${safePhone}*\n📅 *${safeDate}* at ⏰ *${safeTime}*\n👥 *${safeGuests}* guests \n ${transportLine}`;
    const reconfirmLink = `https://wa.me/${cleanBusinessPhone}?text=${encodeURIComponent(reconfirmText)}`;

    const confirmationMsg = `Hello Mr/Mrs *${safeName}* ! \n\nThis is Rach Tours. We've received your reservation request for:\n\n${tourDetailsText}\n💰 *Total:* $${totalReservationPrice}\n📞 *Phone:* *${safePhone}*\n📅 *Date:* *${safeDate}*\n⏰ *Time:* *${safeTime}*\n👥 *Guests:* *${safeGuests}*\n\n Is this correct?\n   ❌ If no, please\n*Resubmit Again:*\n🔗 https://rach-tours.com \n   ✅ If yes, please\n*Confirm By clicking on the link :*\n ${reconfirmLink}\n\nWe look forward to seeing you soon.Thank you for choosing us! ✨`;

    // Admin Notification
    let messageBody = `🔔 *New Reservation Request*\n`;
    messageBody += `══════════════════════\n`;
    messageBody += `👤 *Customer:* ${safeName}\n`;
    messageBody += `📞 *Phone:* ${safePhone}\n`;
    messageBody += `📅 *Date:* ${safeDate}\n`;
    messageBody += `⏰ *Time:* ${safeTime}\n`;
    messageBody += `👥 *Guests:* ${safeGuests}\n`;
    if (anyTransport) messageBody += `${transportLine}\n`;
    messageBody += `══════════════════════\n`;
    messageBody += `🎫 *Tour Details:*\n${tourDetailsText}`;
    messageBody += `\n💰 *Total Price:* $${totalReservationPrice}\n`;
    if (safeSpecial) {
      messageBody += `══════════════════════\n`;
      messageBody += `📝 *Note:*\n <|${safeSpecial}|>\n`;
    }
    messageBody += `══════════════════════\n`;

    const replyLinkPart = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(confirmationMsg)}`;

    // ===================================================================
    // STEP 1: Save to Database FIRST (critical — must not lose reservations)
    // ===================================================================
    if (pool) {
      try {
        const tourNames = enrichedTours.map((t) => t.title).join(", ");

        await pool.execute(
          `INSERT INTO reservations (name, phone, tour, tours, date, time, people, total_price, transport, special_request, confirmation_message, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', COALESCE(?, CURRENT_TIMESTAMP))`,
          [
            safeName,
            safePhone,
            tourNames,
            JSON.stringify(enrichedTours),
            safeDate,
            safeTime,
            safeGuests,
            totalReservationPrice,
            anyTransport ? 1 : 0,
            safeSpecial,
            confirmationMsg,
            clientCreatedAt || null
          ],
        );
      } catch (err) {
        console.error("❌ MySQL insert failed:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to save reservation. Please try again.",
        });
      }
    }

    // ===================================================================
    // STEP 2: Notifications — fire-and-forget, NEVER fail the reservation
    // ===================================================================
    const warnings = [];

    // WhatsApp (non-blocking)
    if (isEnabled(process.env.SEND_TO_WHATSAPP)) {
      const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
      const headers = {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      };

      // Fire both WhatsApp messages, catch errors individually
      Promise.all([
        axios
          .post(
            url,
            {
              messaging_product: "whatsapp",
              to: MY_PHONE_NUMBER,
              type: "text",
              text: { body: messageBody },
            },
            { headers },
          )
          .catch((err) => {
            console.error(
              "⚠️ WhatsApp admin msg failed:",
              err.response?.data || err.message,
            );
          }),
        axios
          .post(
            url,
            {
              messaging_product: "whatsapp",
              to: MY_PHONE_NUMBER,
              type: "text",
              text: { body: `👉 *Click to Reply:* ${replyLinkPart}` },
            },
            { headers },
          )
          .catch((err) => {
            console.error(
              "⚠️ WhatsApp reply link failed:",
              err.response?.data || err.message,
            );
          }),
      ]).catch(() => {}); // Safety net — never throw
    }

    // Google Sheets (non-blocking)
    if (isEnabled(process.env.SEND_TO_GOOGLE_SHEETS)) {
      const SHEET_URL = process.env.GOOGLE_SHEET_SCRIPT_URL;
      const SHEET_TOKEN = process.env.GOOGLE_SHEET_API_TOKEN;

      if (SHEET_URL && SHEET_TOKEN) {
        axios
          .post(SHEET_URL, {
            token: SHEET_TOKEN,
            date: safeDate,
            time: safeTime,
            name: safeName,
            phone: safePhone,
            guests: safeGuests,
            totalPrice: totalReservationPrice,
            transport: anyTransport,
            tours: enrichedTours.map((t) => ({
              title: t.title,
              hasTransport: t.hasTransport,
            })),
            specialRequest: safeSpecial,
          })
          .catch((err) =>
            console.error("⚠️ Google Sheet update failed:", err.message),
          );
      }
    }

    // ===================================================================
    // STEP 3: Return success immediately — reservation is saved
    // ===================================================================
    return res
      .status(200)
      .json({ success: true, message: "Reservation Confirmed" });
  } catch (error) {
    console.error("Reservation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to process reservation.",
    });
  }
};

/**
 * GET /api/confirmed-bookings
 * Public endpoint — returns only date+time for confirmed bookings (no PII).
 */
exports.getConfirmedBookings = async (req, res) => {
  if (!pool) {
    return res.json({ success: true, data: [] });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT date, time, created_at FROM reservations WHERE status = 'confirmed' ORDER BY date ASC`,
    );

    const bookings = rows.map((r) => ({
      date: r.date,
      time: r.time || null,
      created_at: r.created_at || null,
    }));

    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("Confirmed bookings error:", err.message);
    return res.json({ success: true, data: [] });
  }
};
