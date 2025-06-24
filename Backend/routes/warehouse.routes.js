const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createWarehouse, getWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse } = require("../controllers/warehouse.controller");

router.use(auth); // Middleware autentikasi diterapkan
router.post("/", createWarehouse);
router.get("/", getWarehouses);
router.get("/:id", getWarehouseById);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

module.exports = router;
