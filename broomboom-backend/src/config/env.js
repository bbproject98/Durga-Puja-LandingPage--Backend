const dotenv = require("dotenv");
const path = require("path");

// Load .env variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

module.exports = config;

