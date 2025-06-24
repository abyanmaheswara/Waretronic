const StockTransfer = require("../models/StockTransfer.model");
const Stock = require("../models/Stock.model"); // Impor model Stock

exports.createStockTransfer = async (req, res) => {
  try {
    const { reference, sourceWarehouse, destinationWarehouse, items } = req.body;

    // Validasi stok di gudang sumber sebelum membuat transfer
    for (const i of items) {
      const sourceStock = await Stock.findOne({ item: i.item, warehouse: sourceWarehouse, zone: i.zone || null });
      if (!sourceStock || sourceStock.quantity < i.quantity) {
        return res.status(400).json({
          error: `Stok tidak mencukupi untuk item ${i.item} di gudang sumber.`,
        });
      }
      // Opsional: reserved quantity di sumber saat transfer dibuat
      sourceStock.reserved = (sourceStock.reserved || 0) + i.quantity;
      sourceStock.available = (sourceStock.quantity || 0) - (sourceStock.reserved || 0); // available = quantity - reserved
      await sourceStock.save();
    }

    // Buat dokumen transfer dengan status 'Pending' atau 'In Transit'
    const transfer = new StockTransfer({
      reference,
      sourceWarehouse,
      destinationWarehouse,
      items,
      createdBy: req.user.id,
      date: new Date(),
      status: "Pending", // Awalnya Pending
      type: "Transfer",
    });
    await transfer.save();

    res.status(201).json(transfer);
  } catch (err) {
    console.error("Error creating Stock Transfer:", err);
    res.status(400).json({ error: err.message || "Gagal membuat transfer stok" });
  }
};

exports.getStockTransfers = async (req, res) => {
  try {
    const transfers = await StockTransfer.find()
      .populate("sourceWarehouse", "name")
      .populate("destinationWarehouse", "name")
      .populate("items.item", "name sku unit category")
      .populate("items.zone", "name") // Jika item transfer punya zone
      .populate("createdBy", "username");
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Status yang mungkin: 'Pending', 'In Transit', 'Completed', 'Canceled'
    if (!["Pending", "In Transit", "Completed", "Canceled"].includes(status)) {
      return res.status(400).json({ error: "Invalid transfer status" });
    }

    const transfer = await StockTransfer.findById(req.params.id).populate("items.item");
    if (!transfer) return res.status(404).json({ error: "Transfer not found" });

    // Logika update stok saat transfer selesai (status 'Completed')
    if (transfer.status !== "Completed" && status === "Completed") {
      for (const i of transfer.items) {
        // Kurangi reserved di gudang sumber
        await Stock.findOneAndUpdate(
          { item: i.item, warehouse: transfer.sourceWarehouse, zone: i.zone || null },
          { $inc: { reserved: -i.quantity } } // Kurangi reserved
        );

        // Tambah quantity dan available di gudang tujuan
        await Stock.findOneAndUpdate({ item: i.item, warehouse: transfer.destinationWarehouse, zone: i.zone || null }, { $inc: { quantity: i.quantity, available: i.quantity } }, { upsert: true, new: true });
      }
    }
    // Logika jika transfer dibatalkan ('Canceled')
    else if (transfer.status !== "Canceled" && status === "Canceled") {
      for (const i of transfer.items) {
        // Kembalikan reserved di gudang sumber ke available quantity
        await Stock.findOneAndUpdate({ item: i.item, warehouse: transfer.sourceWarehouse, zone: i.zone || null }, { $inc: { reserved: -i.quantity, quantity: i.quantity, available: i.quantity } });
      }
    }
    // Jika status berubah dari Completed ke In Transit (misalnya rollback), perlu logika sebaliknya

    transfer.status = status;
    await transfer.save();

    res.json(transfer);
  } catch (err) {
    console.error("Error updating Stock Transfer status:", err);
    res.status(500).json({ error: err.message });
  }
};
// ... fungsi delete
exports.deleteStockTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findByIdAndDelete(req.params.id);
    if (!transfer) return res.status(404).json({ error: "Transfer not found" });
    res.json({ message: "Transfer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
