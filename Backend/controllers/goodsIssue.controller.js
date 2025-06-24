const GoodsIssue = require("../models/GoodsIssue.model");
const Stock = require("../models/Stock.model");

exports.createGoodsIssue = async (req, res) => {
  try {
    // req.body dari frontend: { refNumber, partnerName, warehouse, items: [{item, quantity}] }
    // Jika frontend menyediakan zone per item: { refNumber, partnerName, warehouse, items: [{item, quantity, zone}] }
    const { refNumber, partnerName, warehouse, items } = req.body;

    // Validasi stok cukup di setiap zona/gudang
    for (const i of items) {
      const stock = await Stock.findOne({ item: i.item, warehouse: warehouse, zone: i.zone || null }); // Tambah warehouse & handle zone
      if (!stock || stock.quantity < i.quantity) {
        return res.status(400).json({
          error: `Stok tidak mencukupi untuk item ${i.item} di ${stock.warehouse?.name || "gudang ini"} zona ${stock.zone?.name || "default"}`,
        });
      }
    }

    // Kurangi stok setelah validasi
    for (const i of items) {
      await Stock.findOneAndUpdate(
        { item: i.item, warehouse: warehouse, zone: i.zone || null },
        { $inc: { quantity: -i.quantity, available: -i.quantity } } // Kurangi available juga
      );
    }

    // Simpan dokumen Goods Issue
    const issue = new GoodsIssue({
      reference: refNumber,
      customerName: partnerName,
      warehouse: warehouse,
      items,
      createdBy: req.user.id,
      date: new Date(),
      status: "Completed",
      type: "Outbound",
    });
    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error("Error creating Goods Issue:", err);
    res.status(400).json({ error: err.message || "Gagal membuat Goods Issue" });
  }
};

exports.getGoodsIssues = async (req, res) => {
  try {
    const issues = await GoodsIssue.find().populate("items.item", "name sku unit category").populate("warehouse", "name").populate("items.zone", "name").populate("createdBy", "username");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGoodsIssueById = async (req, res) => {
  try {
    const issue = await GoodsIssue.findById(req.params.id).populate("items.item").populate("items.zone");
    if (!issue) return res.status(404).json({ error: "Goods Issue not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGoodsIssue = async (req, res) => {
  try {
    const issue = await GoodsIssue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: "Goods Issue not found" });
    res.json({ message: "Goods Issue deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
