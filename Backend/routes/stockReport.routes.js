// Backend/routes/stockReport.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const stockReportController = require("../controllers/stockReport.controller");

router.use(auth);
router.get("/dashboard-summary", stockReportController.getDashboardSummary);
router.get("/recent-transactions", stockReportController.getRecentTransactions);
router.get("/stock-movement", stockReportController.getStockMovement);
router.get("/restock-csv", stockReportController.getRestockCSV);
router.get("/low-stock-detail", stockReportController.getLowStockDetailReport);
router.get("/inventory-valuation", stockReportController.getInventoryValuationReport);

module.exports = router;
