import { pool } from "./db";

async function initDatabase() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS businesses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL
        );
    `);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

  console.log("Database initialized");

  await pool.end();
}

initDatabase().catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
