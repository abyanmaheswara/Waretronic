const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Stock = require("../models/Stock.model");

router.use(auth); // Middleware autentikasi diterapkan
router.get("/", async (req, res) => {
  const stocks = await Stock.find().populate("item zone"); // Perlu populate warehouse juga
  res.json(stocks);
});

console.log("✔ stock.routes.js export:", typeof router); // Console log bisa dihapus
module.exports = router;
