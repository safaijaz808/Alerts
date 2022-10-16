const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: { type: String, default: null },
  phone: { type: String, unique: true },
  password: { type: String },
  check: {type: Array},
  token: {type: String}
});

module.exports = mongoose.model("user", userSchema);