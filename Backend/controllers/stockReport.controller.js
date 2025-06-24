const GoodsReceipt = require("../models/GoodsReceipt.model");
const GoodsIssue = require("../models/GoodsIssue.model");
const StockAdjustment = require("../models/StockAdjustment.model");
const StockTransfer = require("../models/StockTransfer.model");
const Item = require("../models/Item.model"); // Perlu untuk total item, dll.
const Stock = require("../models/Stock.model"); // Perlu untuk low stock, reserved, dll.
const User = require("../models/User.model"); // Perlu untuk createdBy
const mongoose = require("mongoose");

// 1. Dashboard Summary (untuk kartu di index.html)
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments(); // Menghitung total dokumen Item
    const allStocks = await Stock.find().populate("item").populate("warehouse"); // Mengambil semua data stok

    const lowStockItems = allStocks.filter((s) => s.quantity < s.minimum).length; // Menghitung item dengan stok rendah
    const reservedItems = allStocks.filter((s) => s.reserved && s.reserved > 0).length; // Menghitung item yang dipesan

    // Menghitung transfer yang masih "Pending" atau "In Transit"
    const pendingTransfers = await StockTransfer.countDocuments({
      status: { $in: ["Pending", "In Transit"] },
    });

    res.json({
      totalItems,
      lowStockItems,
      pendingTransfers,
      reservedItems,
      // Anda bisa menambahkan total nilai inventaris, dll. di sini
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Recent Transactions (untuk tabel di index.html dan transactions.html)
exports.getRecentTransactions = async (req, res) => {
  try {
    // Ambil parameter dari query string untuk filter dan paginasi
    const limit = parseInt(req.query.limit) || 10; // Default 10 transaksi per halaman
    const page = parseInt(req.query.page) || 1; // Default halaman 1
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";
    const statusFilter = req.query.status ? req.query.status.toLowerCase() : "";

    // Ambil data dari semua koleksi transaksi
    const [receipts, issues, transfers, adjustments] = await Promise.all([
      GoodsReceipt.find().populate("warehouse", "name").populate("items.item", "name sku").populate("createdBy", "username"),
      GoodsIssue.find().populate("warehouse", "name").populate("items.item", "name sku").populate("createdBy", "username"),
      StockTransfer.find().populate("sourceWarehouse destinationWarehouse", "name").populate("items.item", "name sku").populate("createdBy", "username"),
      StockAdjustment.find().populate("warehouse", "name").populate("item", "name sku").populate("createdBy", "username"), // Perhatikan: StockAdjustment hanya punya `item` tunggal
    ]);

    let allTransactions = [];

    // Format Goods Receipts
    receipts.forEach((t) => {
      const itemsCount = t.items ? t.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
      allTransactions.push({
        _id: t._id.toString(),
        transactionId: `GR-${t._id.toString().slice(-4).toUpperCase()}`,
        type: "Receiving",
        status: t.status || "Completed", // Default status jika tidak ada
        date: t.date,
        partnerName: t.supplierName,
        refNumber: t.reference,
        itemsCount: itemsCount,
        warehouse: t.warehouse?.name || "N/A",
        createdBy: t.createdBy?.username || "N/A",
      });
    });

    // Format Goods Issues
    issues.forEach((t) => {
      const itemsCount = t.items ? t.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
      allTransactions.push({
        _id: t._id.toString(),
        transactionId: `GI-${t._id.toString().slice(-4).toUpperCase()}`,
        type: "Outbound",
        status: t.status || "Completed",
        date: t.date,
        partnerName: t.customerName,
        refNumber: t.reference,
        itemsCount: itemsCount,
        warehouse: t.warehouse?.name || "N/A",
        createdBy: t.createdBy?.username || "N/A",
      });
    });

    // Format Stock Transfers
    transfers.forEach((t) => {
      const itemsCount = t.items ? t.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
      allTransactions.push({
        _id: t._id.toString(),
        transactionId: `TRF-${t._id.toString().slice(-4).toUpperCase()}`,
        type: "Transfer",
        status: t.status || "In Transit", // Default status
        date: t.date,
        partnerName: `${t.sourceWarehouse?.name || "N/A"} → ${t.destinationWarehouse?.name || "N/A"}`, // Kombinasi gudang
        refNumber: t.reference,
        itemsCount: itemsCount,
        warehouse: `${t.sourceWarehouse?.name || "N/A"} → ${t.destinationWarehouse?.name || "N/A"}`,
        createdBy: t.createdBy?.username || "N/A",
      });
    });

    // Format Stock Adjustments
    adjustments.forEach((t) => {
      // StockAdjustment yang saya revisi di controller lain, diasumsikan memiliki `item` dan `quantityChange` langsung
      const quantityChangeValue = t.quantityChange ? Math.abs(t.quantityChange) : 0;
      allTransactions.push({
        _id: t._id.toString(),
        transactionId: `ADJ-${t._id.toString().slice(-4).toUpperCase()}`,
        type: "Adjustment",
        status: t.status || "Approved",
        date: t.date,
        partnerName: t.reason || "Penyesuaian Stok", // Menggunakan reason sebagai partner info
        refNumber: null, // Biasanya tidak ada ref number untuk adjustment
        itemsCount: quantityChangeValue,
        warehouse: t.warehouse?.name || "N/A",
        createdBy: t.createdBy?.username || "N/A",
      });
    });

    // Filter berdasarkan search term
    let filteredResults = allTransactions.filter((trx) => {
      const matchesSearch =
        searchTerm === "" ||
        trx.transactionId?.toLowerCase().includes(searchTerm) ||
        trx.type?.toLowerCase().includes(searchTerm) ||
        trx.partnerName?.toLowerCase().includes(searchTerm) ||
        trx.warehouse?.toLowerCase().includes(searchTerm) ||
        trx.refNumber?.toLowerCase().includes(searchTerm);

      const matchesStatus = statusFilter === "" || (trx.status && trx.status.toLowerCase() === statusFilter);

      return matchesSearch && matchesStatus;
    });

    // Urutkan berdasarkan tanggal terbaru
    filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginasi
    const paginatedResults = filteredResults.slice(skip, skip + limit);
    const totalCount = filteredResults.length;

    res.json({
      totalCount,
      transactions: paginatedResults,
    });
  } catch (err) {
    console.error("Error getting recent transactions:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Stock Movement Trends (untuk chart di index.html)
exports.getStockMovement = async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    const now = new Date();
    let startDate;
    let formatString;

    // Menentukan startDate dan format string untuk $dateToString
    if (period === "daily") {
      startDate = new Date(now.setDate(now.getDate() - 7)); // 7 hari terakhir
      formatString = "%Y-%m-%d";
    } else if (period === "weekly") {
      startDate = new Date(now.setDate(now.getDate() - 28)); // 4 minggu terakhir (approx)
      formatString = "%Y-%U"; // %U untuk minggu dari tahun (Minggu pertama adalah 01)
    } else if (period === "monthly") {
      startDate = new Date(now.setMonth(now.getMonth() - 6)); // 6 bulan terakhir
      formatString = "%Y-%m";
    } else {
      // Default ke monthly atau daily jika period tidak valid
      startDate = new Date(now.setDate(now.getDate() - 30)); // 30 hari terakhir jika tidak ada period
      formatString = "%Y-%m-%d";
    }
    const endDate = new Date(); // Sampai hari ini

    const inboundAgg = await GoodsReceipt.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$date" } },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const outboundAgg = await GoodsIssue.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$date" } },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Menggabungkan data untuk chart
    const result = [];
    const allLabels = new Set();
    inboundAgg.forEach((d) => allLabels.add(d._id));
    outboundAgg.forEach((d) => allLabels.add(d._id));

    Array.from(allLabels)
      .sort()
      .forEach((label) => {
        const inboundQty = inboundAgg.find((d) => d._id === label)?.totalQuantity || 0;
        const outboundQty = outboundAgg.find((d) => d._id === label)?.totalQuantity || 0;
        result.push({ label, inbound: inboundQty, outbound: outboundQty });
      });

    res.json(result);
  } catch (err) {
    console.error("Error getting stock movement:", err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Restock Report CSV (untuk button di index.html)
exports.getRestockCSV = async (req, res) => {
  try {
    // Mencari stok di mana kuantitasnya kurang dari minimum
    const lowStockItems = await Stock.find({
      $where: "this.quantity < this.minimum", // Menggunakan $where untuk perbandingan antar field
    })
      .populate("item", "sku name category unit minimum") // Populate detail item
      .populate("warehouse", "name"); // Populate detail gudang

    let csvContent = "SKU,Nama Item,Kategori,Gudang,Stok Saat Ini,Minimum Stok,Unit\n"; // Header CSV

    lowStockItems.forEach((stock) => {
      // Pastikan semua properti ada sebelum diakses
      const sku = stock.item?.sku || "N/A";
      const itemName = stock.item?.name || "N/A";
      const category = stock.item?.category || "N/A";
      const warehouseName = stock.warehouse?.name || "N/A";
      const currentQuantity = stock.quantity || 0;
      const minimumStock = stock.minimum || 0;
      const unit = stock.item?.unit || "N/A";

      // Pastikan tidak ada koma di dalam string yang bisa merusak format CSV
      const escapeCsv = (text) => `"${String(text).replace(/"/g, '""')}"`;

      csvContent += `${escapeCsv(sku)},`;
      csvContent += `${escapeCsv(itemName)},`;
      csvContent += `${escapeCsv(category)},`;
      csvContent += `${escapeCsv(warehouseName)},`;
      csvContent += `${escapeCsv(currentQuantity)},`;
      csvContent += `${escapeCsv(minimumStock)},`;
      csvContent += `${escapeCsv(unit)}\n`;
    });

    // Mengatur header untuk download file CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="restock-report.csv"');
    res.send(csvContent); // Mengirim konten CSV sebagai respons
  } catch (err) {
    console.error("Error generating restock CSV:", err);
    res.status(500).json({ error: err.message });
  }
};
// exports.getLowStockDetailReport (untuk reports.html - Low Stock Report)
exports.getLowStockDetailReport = async (req, res) => {
  try {
    const { warehouseId, category } = req.query; // Ambil filter dari query

    let matchQuery = {
      $where: "this.quantity < this.minimum", // Filter dasar stok rendah
    };

    // Tambahkan filter gudang jika disediakan
    if (warehouseId) {
      matchQuery.warehouse = warehouseId;
    }

    // Cari stok rendah dan populate item dan warehouse
    const lowStocks = await Stock.find(matchQuery)
      .populate({
        path: "item",
        select: "sku name category unit minimum",
        // Jika ada filter kategori, filter juga di sini
        match: category ? { category: category } : {},
      })
      .populate("warehouse", "name")
      .populate("zone", "name"); // Populate zone juga

    // Filter hasil populate jika ada match di item
    const filteredLowStocks = lowStocks.filter((stock) => stock.item !== null);

    res.json(filteredLowStocks);
  } catch (err) {
    console.error("Error generating low stock detail report:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getInventoryValuationReport = async (req, res) => {
  try {
    const { warehouseId, category, date } = req.query; // Filter dari query

    // Filter untuk stock query
    let stockMatchQuery = {};
    if (warehouseId) {
      stockMatchQuery.warehouse = warehouseId;
    }

    // Filter untuk item query (berdasarkan kategori)
    let itemMatchQuery = {};
    if (category) {
      itemMatchQuery.category = category;
    }

    // Ambil data stok berdasarkan filter
    const stocks = await Stock.find(stockMatchQuery)
      .populate({
        path: "item",
        select: "name sku category unit price", // Asumsikan ada field 'price' di Item.model
        match: itemMatchQuery, // Terapkan filter kategori pada item
      })
      .populate("warehouse", "name")
      .populate("zone", "name");

    let totalValue = 0;
    let totalItemsCount = 0;
    const categoryValuation = {}; // { categoryName: { value: X, count: Y } }
    const warehouseValuation = {}; // { warehouseName: { value: X, count: Y } }

    stocks.forEach((stock) => {
      // Pastikan item tidak null (karena populate match bisa mengembalikan null)
      if (stock.item) {
        const itemValue = (stock.quantity || 0) * (stock.item.price || 0);
        totalValue += itemValue;
        totalItemsCount += stock.quantity || 0;

        // Perhitungan per kategori
        const catName = stock.item.category || "Uncategorized";
        if (!categoryValuation[catName]) {
          categoryValuation[catName] = { value: 0, count: 0 };
        }
        categoryValuation[catName].value += itemValue;
        categoryValuation[catName].count += stock.quantity || 0;

        // Perhitungan per gudang
        const whName = stock.warehouse?.name || "Unknown Warehouse";
        if (!warehouseValuation[whName]) {
          warehouseValuation[whName] = { value: 0, count: 0 };
        }
        warehouseValuation[whName].value += itemValue;
        warehouseValuation[whName].count += stock.quantity || 0;
      }
    });

    // Ubah objek menjadi array untuk respons yang lebih mudah diproses frontend
    const formattedCategoryValuation = Object.keys(categoryValuation).map((key) => ({
      category: key,
      value: categoryValuation[key].value,
      count: categoryValuation[key].count,
    }));

    const formattedWarehouseValuation = Object.keys(warehouseValuation).map((key) => ({
      warehouse: key,
      value: warehouseValuation[key].value,
      count: warehouseValuation[key].count,
    }));

    res.json({
      totalValue,
      totalItemsCount,
      categoryValuation: formattedCategoryValuation,
      warehouseValuation: formattedWarehouseValuation,
      asOfDate: date || new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error("Error generating inventory valuation report:", err);
    res.status(500).json({ error: err.message });
  }
};
