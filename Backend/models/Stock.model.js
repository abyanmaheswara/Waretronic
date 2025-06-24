const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item wajib diisi."],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang wajib diisi."],
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null, // Zone bisa null jika item tidak spesifik ke zona
    },
    quantity: {
      type: Number,
      required: [true, "Kuantitas wajib diisi."],
      default: 0,
      min: [0, "Kuantitas tidak boleh negatif."],
    },
    minimum: {
      // Minimum stock level for this specific item in this warehouse/zone
      type: Number,
      default: 0,
      min: [0, "Minimum stok tidak boleh negatif."],
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, "Kuantitas reserved tidak boleh negatif."],
    },
  },
  { timestamps: true }
);

// Indeks unik untuk memastikan satu entri stok per item, per gudang, per zona
// Ini penting untuk konsistensi data stok
stockSchema.index({ item: 1, warehouse: 1, zone: 1 }, { unique: true });

module.exports = mongoose.model("Stock", stockSchema);
