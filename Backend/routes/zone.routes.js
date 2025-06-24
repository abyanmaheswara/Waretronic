const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zone.controller");
const auth = require("../middleware/auth");

router.use(auth); // Middleware autentikasi diterapkan
router.post("/", zoneController.createZone);
router.get("/", zoneController.getZones);
router.get("/:id", zoneController.getZoneById);
router.put("/:id", zoneController.updateZone);
router.delete("/:id", zoneController.deleteZone);

module.exports = router;
