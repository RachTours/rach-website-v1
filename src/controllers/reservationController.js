const { validationResult } = require("express-validator");
const axios = require("axios");
const {
  unescapeHTMLEntities,
  escapeSequencesToLiteral,
} = require("../utils/stringUtils");
const { pool } = require("../config/database");

// Hardcoded data (cms-like)
const { TOURS, TRANSPORT_FEE } = require("../../js/data.js");

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MY_PHONE_NUMBER = process.env.MY_PHONE_NUMBER;

exports.createReservation = async (req, res) => {
  // Check Validation Results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation Errors:", errors.array());
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: errors.array(),
    });
  }

  try {
    const { name, phone, date, time, guests, special, selectedTours } =
      req.body;

    // Log only non-PII metrics in development
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `New Reservation: ${selectedTours ? selectedTours.length : 0} tours selected.`,
      );
    }

    // Strict Type Validation
    if (typeof selectedTours !== "object" || !Array.isArray(selectedTours)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tours data" });
    }

    const safeGuests =
      typeof guests === "string"
        ? parseInt(guests, 10)
        : (typeof guests === "number" ? guests : 1) || 1;
    const safeName = typeof name === "string" ? name : String(name || "");
    const safePhone = typeof phone === "string" ? phone : String(phone || "");
    const safeDate = typeof date === "string" ? date : String(date || "");
    const safeTime = typeof time === "string" ? time : String(time || "");
    let safeSpecial = special && typeof special === "string" ? special : "";

    if (selectedTours.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No tours selected." });
    }

    // --- Message Construction ---
    let anyTransport = false;
    let tourDetailsText = "";
    let totalReservationPrice = 0;

    const groups = {};
    const enrichedTours = []; // New array to store detailed tour info for DB

    selectedTours.forEach((item) => {
      const tourId = item.tourId;
      const tour = TOURS[tourId];
      if (tour) {
        if (!groups[tour.category]) {
          groups[tour.category] = [];
        }
        const hasTransport = item.hasTransport === true;
        const basePrice = tour.price;
        const singlePersonPrice =
          basePrice + (hasTransport ? TRANSPORT_FEE : 0);
        const itemTotal = singlePersonPrice * safeGuests;

        const enrichedItem = {
          tourId: tourId,
          title: tour.title,
          category: tour.category,
          pricePerPerson: singlePersonPrice,
          basePrice: basePrice,
          hasTransport: hasTransport,
          transportFee: hasTransport ? TRANSPORT_FEE : 0,
          guests: safeGuests,
          totalPrice: itemTotal,
        };

        groups[tour.category].push({
          title: tour.title,
          hasTransport,
          itemTotal,
        });

        enrichedTours.push(enrichedItem);

        totalReservationPrice += itemTotal;
      }
    });

    for (const [category, items] of Object.entries(groups)) {
      const sectionTotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
      tourDetailsText += `*${category}* (Total: $${sectionTotal}):\n`;
      items.forEach((item) => {
        if (item.hasTransport) anyTransport = true;
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

    // Reply Links
    let cleanPhone = safePhone.replace(/\D/g, "");
    const businessPhone = MY_PHONE_NUMBER || "212659727363";
    const cleanBusinessPhone = businessPhone.replace(/\D/g, "");

    const reconfirmText = `✅ Reservation Confirmed :
👤 *${safeName}*
📞 *${safePhone}*
📅 *${safeDate}* at ⏰ *${safeTime}*
👥 *${safeGuests}* guests 
 ${transportLine}`;
    const reconfirmLink = `https://wa.me/${cleanBusinessPhone}?text=${encodeURIComponent(reconfirmText)}`;

    // EXACT Requested Format
    const confirmationMsg = `Hello Mr/Mrs *${safeName}* ! 

This is Rach Tours. We've received your reservation request for:

${tourDetailsText}
💰 *Total:* $${totalReservationPrice}
📞 *Phone:* *${safePhone}*
📅 *Date:* *${safeDate}*
⏰ *Time:* *${safeTime}*
👥 *Guests:* *${safeGuests}*

 Is this correct?
   ❌ If no, please
*Resubmit Again:*
🔗 https://rach-tours.com 
   ✅ If yes, please
*Confirm By clicking on the link :*
 ${reconfirmLink}

We look forward to seeing you soon.Thank you for choosing us! ✨`;

    const replyLinkPart = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(confirmationMsg)}`;

    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    const headers = {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    };

    // --- Database First (Data Integrity) ---
    // Save to DB BEFORE sending notifications so we never lose a reservation record.
    if (pool) {
      try {
        const tourNames = selectedTours
          .map((t) => {
            const tour = TOURS[t.tourId];
            return tour ? tour.title : t.tourId;
          })
          .join(", ");

        await pool.execute(
          `INSERT INTO reservations (name, phone, tour, tours, date, time, people, total_price, transport, special_request, confirmation_message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
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
          ],
        );
        if (process.env.NODE_ENV !== "production")
          console.log("MySQL: Reservation saved.");
      } catch (err) {
        console.error("❌ MySQL insert failed:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to save reservation. Please try again.",
        });
      }
    }

    // --- Notifications (Non-Critical, fire after DB success) ---
    const promises = [];

    // 1. Send Main WhatsApp to Admin
    const sendAdminMsg = axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: MY_PHONE_NUMBER,
        type: "text",
        text: { body: messageBody },
      },
      { headers },
    );
    promises.push(sendAdminMsg);

    // 2. Send Reply Link
    if (replyLinkPart) {
      const sendReplyLink = axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to: MY_PHONE_NUMBER,
          type: "text",
          text: { body: `👉 *Click to Reply:* ${replyLinkPart}` },
        },
        { headers },
      );
      promises.push(sendReplyLink);
    }

    // 3. Google Sheets (Fire-and-forget)
    const SHEET_URL = process.env.GOOGLE_SHEET_SCRIPT_URL;
    const SHEET_TOKEN = process.env.GOOGLE_SHEET_API_TOKEN;

    if (SHEET_URL && SHEET_TOKEN) {
      const sheetPayload = {
        token: SHEET_TOKEN,
        date: safeDate,
        time: safeTime,
        name: safeName,
        phone: safePhone,
        guests: safeGuests,
        totalPrice: totalReservationPrice,
        transport: anyTransport,
        tours: selectedTours.map((t) => {
          const tour = TOURS[t.tourId];
          return {
            title: tour ? tour.title : t.tourId,
            hasTransport: t.hasTransport,
          };
        }),
        specialRequest: safeSpecial,
      };

      axios
        .post(SHEET_URL, sheetPayload)
        .then(() => {
          if (process.env.NODE_ENV !== "production")
            console.log("Google Sheet updated.");
        })
        .catch((err) =>
          console.error("❌ Failed to update Google Sheet:", err.message),
        );
    }

    // Wait for WhatsApp notifications
    await Promise.all(promises);
    if (process.env.NODE_ENV !== "production")
      console.log("All notifications sent successfully.");

    return res
      .status(200)
      .json({ success: true, message: "Reservation Confirmed" });
  } catch (error) {
    console.error(
      "WhatsApp API Error:",
      error.response ? error.response.data : error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message.",
      // Only expose error details in development
      ...(process.env.NODE_ENV !== "production" && {
        error: error.response ? error.response.data : error.message,
      }),
    });
  }
};
