const mongoose = require("mongoose");

const stockAdjustmentSchema = new mongoose.Schema(
  {
    item: {
      // Referensi ke Item yang disesuaikan
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item wajib diisi."],
    },
    warehouse: {
      // Gudang tempat penyesuaian
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang wajib diisi."],
    },
    zone: {
      // Zona tempat penyesuaian (opsional)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    quantityChange: {
      // Perubahan kuantitas (+ untuk penambahan, - untuk pengurangan)
      type: Number,
      required: [true, "Jumlah perubahan wajib diisi."],
      // Tidak ada min di sini karena bisa positif atau negatif
    },
    reason: {
      // Alasan penyesuaian
      type: String,
      required: [true, "Alasan penyesuaian wajib diisi."],
      trim: true,
    },
    status: {
      // Status penyesuaian
      type: String,
      enum: {
        values: ["Pending", "Approved", "Rejected"],
        message: "Status tidak valid. Pilihan: Pending, Approved, Rejected.",
      },
      default: "Approved",
    },
    type: {
      // Tipe transaksi
      type: String,
      default: "Adjustment",
    },
    createdBy: {
      // User yang membuat transaksi
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      // Tanggal penyesuaian
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
