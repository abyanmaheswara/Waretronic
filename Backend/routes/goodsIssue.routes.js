const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createGoodsIssue, getGoodsIssues, getGoodsIssueById, deleteGoodsIssue } = require("../controllers/goodsIssue.controller");

router.use(auth); // Middleware autentikasi diterapkan
router.post("/", createGoodsIssue);
router.get("/", getGoodsIssues);
router.get("/:id", getGoodsIssueById);
router.delete("/:id", deleteGoodsIssue);

module.exports = router;
