// src/config/database.js
let mysql;
let pool = null;

try {
  mysql = require("mysql2/promise");

  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 25,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
    connectTimeout: 10000, // 10 seconds
    idleTimeout: 60000, // Release idle connections after 60s
  });

  console.log("✅ MySQL pool created.");
} catch (err) {
  console.warn("⚠️ mysql2 not installed. Database features disabled.");
  console.warn("   Run: npm install mysql2");
}

/**
 * Test pooled connection with retry logic
 */
async function testConnection(retries = 3, delay = 2000) {
  if (!pool) return false;

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log("✅ Database connection verified.");
      return true;
    } catch (err) {
      console.error(
        `❌ DB connection attempt ${i + 1}/${retries} failed: ${err.message}`,
      );
      if (i < retries - 1) {
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
  }
  console.error(
    "❌ All DB connection attempts failed. Server will run without database.",
  );
  return false;
}

async function initDatabase() {
  if (!pool) {
    console.warn("⚠️ Database pool not available. Skipping table init.");
    return;
  }

  const connected = await testConnection();
  if (!connected) return;

  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully!");

    // 1. Create Table if not exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        country VARCHAR(100),
        tour VARCHAR(255),
        date DATE,
        people INT DEFAULT 1,
        transport BOOLEAN DEFAULT false,
        total_price DECIMAL(10,2),
        status ENUM('pending','confirmed','cancelled','successful') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Add Missing Columns (Schema Migration)
    const queries = [
      "ALTER TABLE reservations ADD COLUMN time VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE reservations ADD COLUMN special_request TEXT DEFAULT NULL",
      "ALTER TABLE reservations MODIFY tour TEXT", // Expand tour to TEXT for JSON or long strings
      "ALTER TABLE reservations ADD COLUMN tours TEXT DEFAULT NULL", // Dedicated JSON column
      "ALTER TABLE reservations ADD COLUMN confirmation_message TEXT DEFAULT NULL", // Stores pre-generated WhatsApp message
      "ALTER TABLE reservations MODIFY COLUMN status ENUM('pending','confirmed','cancelled','successful') DEFAULT 'pending'", // Add successful status
    ];

    for (const q of queries) {
      try {
        await conn.query(q);
      } catch (e) {
        // Ignore duplicate column errors (Error 1060)
        if (e.errno !== 1060) console.log(`Migration note: ${e.message}`);
      }
    }

    console.log("✅ Reservations table schema ready.");

    // 3. Add Performance Indexes (Scalability)
    const indexQueries = [
      "CREATE INDEX idx_res_date ON reservations(date)",
      "CREATE INDEX idx_res_status ON reservations(status)",
      "CREATE INDEX idx_res_status_date ON reservations(status, date)",
    ];

    for (const iq of indexQueries) {
      try {
        await conn.query(iq);
      } catch (e) {
        // Ignore duplicate index errors
      }
    }

    conn.release();
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
  }
}

module.exports = { pool, initDatabase, testConnection };
