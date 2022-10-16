const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, default: null },
  id: { type: String, unique: true },
  expires: { type: Number }
});

module.exports = mongoose.model("token", userSchema);