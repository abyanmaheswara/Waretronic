const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
  {
    transferDate: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang sumber wajib diisi."],
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang tujuan wajib diisi."],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "In Transit", "Completed", "Canceled"],
        message: "Status tidak valid. Pilihan: Pending, In Transit, Completed, Canceled.",
      },
      default: "Pending",
    },
    type: {
      type: String,
      default: "Transfer",
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: [true, "Item wajib diisi."],
        },
        quantity: {
          type: Number,
          required: [true, "Kuantitas item wajib diisi."],
          min: [1, "Kuantitas item minimal 1."],
        },
        zone: {
          // Tambahkan zone jika transfer bisa per zona
          type: mongoose.Schema.Types.ObjectId,
          ref: "Zone",
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockTransfer", stockTransferSchema);
