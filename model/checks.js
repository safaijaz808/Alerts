const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema({
  phone:{type: String},
  checkid:{ type: String },
  protocol: {type: String},
  url:{type: String},
  method:{type: String},
  successCodes: {type: Array},
  timeoutSeconds:{type:Number},
});

module.exports = mongoose.model("checks", checkSchema);