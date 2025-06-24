const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createGoodsReceipt, getGoodsReceipts, getGoodsReceiptById, deleteGoodsReceipt } = require("../controllers/goodsReceipt.controller");

router.use(auth); // Middleware autentikasi diterapkan
router.post("/", createGoodsReceipt);
router.get("/", getGoodsReceipts);
router.get("/:id", getGoodsReceiptById);
router.delete("/:id", deleteGoodsReceipt);

console.log("✔ goodsReceipt.routes.js export:", typeof router); // Console log bisa dihapus
module.exports = router;
