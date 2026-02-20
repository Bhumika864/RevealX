const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");


// // Load environment variables
dotenv.config();

// // App setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// // DB connection
require("./config/db");

// // Routes
app.use("/api/notes", require("./routes/notes"));


// // Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


