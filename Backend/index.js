const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// --- Route imports ---
// Pastikan semua file rute ini ada di folder Backend/routes/
const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const zoneRoutes = require("./routes/zone.routes");
const goodsReceiptRoutes = require("./routes/goodsReceipt.routes");
const goodsIssueRoutes = require("./routes/goodsIssue.routes");
const stockTransferRoutes = require("./routes/stockTransfer.routes");
const stockAdjustmentRoutes = require("./routes/stockAdjustment.routes");
const stockReportRoutes = require("./routes/stockReport.routes");
const stockRoutes = require("./routes/stock.routes");

// --- Middleware imports ---
const errorHandler = require("./middleware/errorHandler");

// --- Konfigurasi Awal Aplikasi ---
dotenv.config(); // Memuat variabel lingkungan dari file .env
connectDB(); // Menghubungkan ke database MongoDB

const app = express();
app.use(cors()); // Mengizinkan permintaan lintas domain dari frontend
app.use(express.json()); // Mengizinkan Express untuk membaca JSON di body permintaan

// --- Penanganan File Statis Frontend ---
// Mendefinisikan jalur absolut ke folder Frontend
const frontendPath = path.resolve(__dirname, "..", "Frontend");
app.use(express.static(frontendPath)); // Menyajikan semua file statis dari folder Frontend

// --- Rute Eksplisit untuk Setiap Halaman HTML Utama ---
// Ini penting agar URL langsung ke file HTML (misal /logindanregister.html) bisa diakses
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "logindanregister.html"));
});
app.get("/logindanregister.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "logindanregister.html"));
});
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
app.get("/masteritem.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "masteritem.html"));
});
app.get("/stocklevels.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "stocklevels.html"));
});
app.get("/transactions.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "transactions.html"));
});
app.get("/warehouses.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "warehouses.html"));
});
app.get("/reports.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "reports.html"));
});
app.get("/settings.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "settings.html"));
});
app.get("/zone.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "zone.html"));
});

// --- Definisi Rute API ---
// Pastikan nama prefix API di sini konsisten dengan panggilan di frontend
// dan nama file rute di folder `Backend/routes/` Anda.
app.use("/api/auth", authRoutes); // Untuk autentikasi user dan user management
app.use("/api/items", itemRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/zones", zoneRoutes);

// Penyesuaian nama rute agar konsisten dengan panggilan frontend dan nama controller
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/goods-issues", goodsIssueRoutes);
app.use("/api/stocktransfers", stockTransferRoutes); // Diubah dari /api/transfers
app.use("/api/stock-adjustments", stockAdjustmentRoutes); // Diubah dari /api/adjustments

app.use("/api/reports", stockReportRoutes); // Untuk berbagai laporan dan dashboard summary
app.use("/api/stocks", stockRoutes); // Untuk mendapatkan data stok secara umum

// --- Middleware Penanganan Error Global ---
// Harus ditempatkan setelah semua rute lain
app.use(errorHandler);

// --- Menjalankan Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
