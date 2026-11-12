const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");

require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 5001);
const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  RESP: 2,
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

const createRateLimiter = ({ prefix, windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix,
    }),
  });

app.get("/health", (req, res) => {
  const ready = redisClient.isReady;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "unavailable",
    redis: ready ? "ready" : "unavailable",
  });
});

app.use(
  "/api/auth",
  createRateLimiter({
    prefix: "invisinotes:gateway:auth:",
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: "Too many attempts. Try again later.",
  })
);

app.use(
  "/api/notes",
  createRateLimiter({
    prefix: "invisinotes:gateway:notes:",
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests. Please try again later.",
  })
);

const createApiProxy = (pathRewrite) => createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  xfwd: true,
  pathRewrite,
  proxyTimeout: 30_000,
  on: {
    error: (err, req, res) => {
      console.error("Service proxy error:", err.message);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Application service unavailable." }));
      }
    },
  },
});

const authProxy = createApiProxy({});
const noteProxy = createApiProxy({});
const revealProxy = createApiProxy({});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth/")) {
    return authProxy(req, res, next);
  }
  if (req.path.startsWith("/api/notes/shared/")) {
    return revealProxy(req, res, next);
  }
  if (req.path === "/api/notes" || req.path.startsWith("/api/notes/")) {
    return noteProxy(req, res, next);
  }
  next();
});

const start = async () => {
  await redisClient.connect();
  const server = app.listen(port, () => {
    console.log(`API gateway listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((err) => {
  console.error("API gateway failed to start:", err.message);
  process.exitCode = 1;
});
