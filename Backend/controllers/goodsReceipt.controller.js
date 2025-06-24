const GoodsReceipt = require("../models/GoodsReceipt.model");
const Stock = require("../models/Stock.model"); // Sudah ada
// const Item = require("../models/Item.model"); // Tidak digunakan, bisa dihapus jika tidak ada keperluan lain

exports.createGoodsReceipt = async (req, res) => {
  try {
    // req.body dari frontend: { refNumber, partnerName, warehouse, items: [{item, quantity}] }
    // Jika frontend menyediakan zone per item: { refNumber, partnerName, warehouse, items: [{item, quantity, zone}] }
    const { refNumber, partnerName, warehouse, items } = req.body; // Menyesuaikan dengan body frontend

    // Loop untuk update atau membuat stok
    for (const i of items) {
      // Penting: Update stok berdasarkan item, warehouse, dan (opsional) zone
      // Asumsi i.item adalah ID item, i.quantity adalah kuantitas
      // Asumsi i.zone adalah ID zona (jika digunakan)
      await Stock.findOneAndUpdate(
        { item: i.item, warehouse: warehouse, zone: i.zone || null }, // Tambah warehouse & handle zone
        { $inc: { quantity: i.quantity, available: i.quantity } }, // Juga update available stock
        { upsert: true, new: true } // Buat jika belum ada, kembalikan dokumen baru
      );
    }

    // Simpan dokumen Goods Receipt
    const receipt = new GoodsReceipt({
      reference: refNumber, // Gunakan refNumber
      supplierName: partnerName, // Gunakan partnerName
      warehouse: warehouse,
      items,
      createdBy: req.user.id, // Pastikan req.user.id tersedia dari middleware auth
      date: new Date(), // Tambahkan tanggal transaksi
      status: "Completed", // Asumsi completed saat GR dibuat
      type: "Receiving", // Tambahkan tipe transaksi
    });
    await receipt.save();

    res.status(201).json(receipt);
  } catch (err) {
    console.error("Error creating Goods Receipt:", err);
    res.status(400).json({ error: err.message || "Gagal membuat Goods Receipt" });
  }
};

exports.getGoodsReceipts = async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find()
      .populate("items.item", "name sku unit category") // Populate item details
      .populate("warehouse", "name") // Populate warehouse name
      .populate("items.zone", "name") // Populate zone name if applicable
      .populate("createdBy", "username"); // Populate createdBy user
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getGoodsReceiptById = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id).populate("items.item").populate("items.zone");
    if (!receipt) return res.status(404).json({ error: "Receipt not found" });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findByIdAndDelete(req.params.id);
    if (!receipt) return res.status(404).json({ error: "Receipt not found" });
    res.json({ message: "Receipt deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
