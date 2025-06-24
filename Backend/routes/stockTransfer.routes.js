const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const stockTransferController = require("../controllers/stockTransfer.controller");
console.log("🛠 stockTransferController:", stockTransferController); // Console log bisa dihapus

const { createStockTransfer, getStockTransfers, updateTransferStatus, deleteStockTransfer } = stockTransferController;

router.use(auth); // Middleware autentikasi diterapkan
router.post("/", createStockTransfer);
router.get("/", getStockTransfers);
router.put("/:id/status", updateTransferStatus); // Update status transfer
router.delete("/:id", deleteStockTransfer);

module.exports = router;
