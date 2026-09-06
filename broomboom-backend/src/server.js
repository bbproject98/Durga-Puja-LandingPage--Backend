const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/env");
const prisma = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Import Routes
const leadRoutes = require("./routes/leadRoutes");
const fleetRoutes = require("./routes/fleetRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// 1. Global Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", config.frontendUrl],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// Silence favicon 404s
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 2. Root API Documentation / Welcome Page
app.get(["/", "/api/docs", "/docs"], (req, res) => {
  // If JSON request, return JSON
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(200).json({
      name: "BroomBoom Cabs Backend API",
      version: "1.0.0",
      description: "Kolkata Durga Puja & Outstation Chauffeur Rentals API",
      status: "RUNNING",
      endpoints: {
        health: "GET /api/health",
        fleet: "GET /api/fleet",
        packages: "GET /api/packages",
        leads: "POST /api/leads | GET /api/leads",
        bookings: "POST /api/bookings | GET /api/bookings/:id",
      },
    });
  }

  // Otherwise render interactive visual HTML dashboard
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BroomBoom Cabs — Backend API</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #FFFDF7; color: #0F172A; padding: 40px 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: #FFFFFF; border: 2px solid #FDE68A; border-radius: 24px; padding: 36px; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.1); }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #FEF3C7; }
        .logo-badge { background: #0F172A; color: #F59E0B; font-weight: 900; font-size: 14px; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-center: center; border: 1px solid #F59E0B; }
        h1 { font-size: 24px; font-weight: 900; color: #0F172A; }
        .tag { background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; border: 1px solid #FDE68A; display: inline-block; }
        .status-pill { background: #DCFCE7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
        .status-dot { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; display: inline-block; }
        .grid { display: grid; gap: 14px; margin-top: 24px; }
        .card { background: #FFFDF7; border: 1px solid #FDE68A; border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; text-decoration: none; color: inherit; transition: all 0.2s; }
        .card:hover { transform: translateY(-2px); border-color: #F59E0B; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15); }
        .method { font-size: 11px; font-weight: 900; padding: 4px 8px; border-radius: 6px; margin-right: 10px; }
        .method.get { background: #EFF6FF; color: #1D4ED8; }
        .method.post { background: #F0FDF4; color: #15803D; }
        .endpoint-name { font-weight: 700; font-size: 15px; font-family: monospace; }
        .desc { font-size: 12px; color: #64748B; margin-top: 2px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #FEF3C7; text-align: center; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">BBC</div>
          <div>
            <h1>🪔 BroomBoom Cabs — Backend API</h1>
            <p style="font-size: 13px; color: #64748B;">Express.js + Prisma ORM Service</p>
          </div>
          <div style="margin-left: auto;">
            <span class="status-pill"><span class="status-dot"></span> Live &amp; Operational</span>
          </div>
        </div>

        <p style="font-size: 14px; color: #475569;">
          The BroomBoom backend is connected and ready to serve your Next.js frontend (running at <a href="${config.frontendUrl}" target="_blank" style="color: #D97706; font-weight: bold;">${config.frontendUrl}</a>).
        </p>

        <h3 style="margin-top: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #92400E;">Available API Endpoints</h3>

        <div class="grid">
          <a class="card" href="/api/health" target="_blank">
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-name">/api/health</span>
              <div class="desc">Database connection status and service heartbeat</div>
            </div>
            <span style="font-size: 18px; color: #F59E0B;">➔</span>
          </a>

          <a class="card" href="/api/fleet" target="_blank">
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-name">/api/fleet</span>
              <div class="desc">Get all 6 Durga Puja vehicles with inclusions &amp; exclusions</div>
            </div>
            <span style="font-size: 18px; color: #F59E0B;">➔</span>
          </a>

          <a class="card" href="/api/packages" target="_blank">
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-name">/api/packages</span>
              <div class="desc">Get all 4 Rental Circuits &amp; 8 Outstation Routes</div>
            </div>
            <span style="font-size: 18px; color: #F59E0B;">➔</span>
          </a>

          <a class="card" href="/api/leads" target="_blank">
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-name">/api/leads</span>
              <div class="desc">List customer leads captured from the Login popup</div>
            </div>
            <span style="font-size: 18px; color: #F59E0B;">➔</span>
          </a>

          <a class="card" href="/api/bookings" target="_blank">
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-name">/api/bookings</span>
              <div class="desc">List all confirmed bookings with 20% advance calculation</div>
            </div>
            <span style="font-size: 18px; color: #F59E0B;">➔</span>
          </a>
        </div>

        <div class="footer">
          BroomBoom Cabs • Kolkata Durga Puja &amp; Outstation Chauffeur Rentals • Port ${config.port}
        </div>
      </div>
    </body>
    </html>
  `);
});

// 3. Health Check Endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      service: "broomboom-backend",
      status: "HEALTHY",
      database: "CONNECTED",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      service: "broomboom-backend",
      status: "DEGRADED",
      database: "DISCONNECTED",
      error: error.message,
    });
  }
});

// 4. Mount API Routers
app.use("/api/leads", leadRoutes);
app.use("/api/fleet", fleetRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);

// 5. 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found. Visit http://localhost:${config.port}/ for API documentation.`,
  });
});

// 6. Central Error Handler
app.use(errorHandler);

// 7. Start Server
const server = app.listen(config.port, () => {
  console.log(`\n🪔 BroomBoom Cabs Backend API running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API Dashboard & Docs: http://localhost:${config.port}/`);
  console.log(`🔗 Health check: http://localhost:${config.port}/api/health\n`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down BroomBoom backend gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("Terminating BroomBoom backend gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
