const express = require("express");
const cors = require("cors");
const revealRoutes = require("./routes/revealRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_PREVIEW].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(revealRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT || 5003);
app.listen(port, () => {
  console.log(`Reveal service listening on port ${port}`);
});
