const express = require("express");
const router = express.Router();
const stockAdjustmentController = require("../controllers/stockAdjustment.controller");
const auth = require("../middleware/auth");

console.log("Controller:", stockAdjustmentController); // Console log bisa dihapus

router.use(auth); // Middleware autentikasi diterapkan

router.post("/", stockAdjustmentController.createAdjustment);
router.get("/", stockAdjustmentController.getAdjustments);
router.get("/:id", stockAdjustmentController.getAdjustmentById);
router.put("/:id/status", stockAdjustmentController.updateAdjustmentStatus); // Update status adjustment

module.exports = router;
