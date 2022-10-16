require("dotenv").config();
require("./config/database").connect();
const express = require("express");
//var workers = require("./lib/workers");

const app = express();

app.use(express.json());



module.exports = app;