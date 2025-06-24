const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createItem, getItems, getItemById, updateItem, deleteItem } = require("../controllers/item.controller");

router.use(auth); // Middleware autentikasi diterapkan untuk semua rute di file ini
router.post("/", createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
