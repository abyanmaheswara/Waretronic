const StockAdjustment = require("../models/StockAdjustment.model");
const Stock = require("../models/Stock.model"); // Impor model Stock

exports.createAdjustment = async (req, res) => {
  try {
    // Frontend mengirim: { item, warehouse, zone, quantityChange, reason }
    const { item, warehouse, zone, quantityChange, reason } = req.body;

    // Update stok di model Stock
    await Stock.findOneAndUpdate(
      { item: item, warehouse: warehouse, zone: zone || null }, // Cari berdasarkan item, warehouse, zone
      { $inc: { quantity: quantityChange, available: quantityChange } }, // Tambah/kurangi quantity dan available
      { upsert: true, new: true } // Buat jika belum ada
    );

    const adjustment = new StockAdjustment({
      item, // Atau jika `items` adalah array, sesuaikan
      warehouse,
      zone,
      quantityChange, // Simpan quantityChange di dokumen adjustment
      reason,
      createdBy: req.user.id,
      date: new Date(),
      status: "Approved", // Asumsi penyesuaian langsung Approved
      type: "Adjustment",
    });
    await adjustment.save();

    res.status(201).json(adjustment);
  } catch (err) {
    console.error("Error creating Stock Adjustment:", err);
    res.status(400).json({ error: err.message || "Gagal membuat penyesuaian stok" });
  }
};

exports.getAdjustments = async (req, res) => {
  try {
    // Populate references to get full details
    const list = await StockAdjustment.find()
      .populate("item", "name sku unit category") // Jika `item` adalah ID tunggal
      .populate("warehouse", "name")
      .populate("zone", "name")
      .populate("createdBy", "username"); // Populate createdBy user
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAdjustmentById = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id).populate("items.item items.zone createdBy");
    if (!adjustment) return res.status(404).json({ error: "Not found" });
    res.json(adjustment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdjustmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const adjustment = await StockAdjustment.findById(req.params.id);
    if (!adjustment) return res.status(404).json({ error: "Not found" });

    adjustment.status = status;
    await adjustment.save();

    res.json(adjustment);
  } catch (err) {
    res.status(500).json({ error: err.message }); // ✅ FIXED LINE
  }
};
