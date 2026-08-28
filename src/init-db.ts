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

    console.log("Database initialized");

    await pool.end();
}

initDatabase().catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
});