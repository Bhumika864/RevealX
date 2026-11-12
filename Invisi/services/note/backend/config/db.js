const mongoose = require("mongoose");

const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Note service connected to MongoDB");
};

module.exports = connectDatabase;
