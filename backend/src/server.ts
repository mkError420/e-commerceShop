import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ENV } from "./config/env";
import { connectDatabase } from "./config/db";
import apiRoutes from "./routes/index";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware";

const app = express();

// Middlewares
app.use(
  cors({
    origin: [ENV.CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    service: "Bangladeshi E-Commerce Backend API",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      payments: ["BKASH", "NAGAD", "SSLCOMMERZ", "COD"],
      courier: ["Pathao", "Steadfast"],
      hubs: ["Dhaka Central Hub", "Chittagong Port Hub"],
    },
  });
});

// Mount Main API Routes
app.use("/api/v1", apiRoutes);

// Catch 404 and Forward to Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
async function startServer() {
  await connectDatabase();

  const server = app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Bangladeshi E-Commerce Backend Server Live!`);
    console.log(`📡 URL: http://localhost:${ENV.PORT}`);
    console.log(`🏥 Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`🛍️ Products API: http://localhost:${ENV.PORT}/api/v1/products`);
    console.log(`📦 Orders API: http://localhost:${ENV.PORT}/api/v1/orders`);
    console.log(`💳 bKash/Nagad PGW: Active in Sandbox Mode`);
    console.log(`====================================================`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[Server] Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log("[Server] HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
  process.exit(1);
});

export default app;
