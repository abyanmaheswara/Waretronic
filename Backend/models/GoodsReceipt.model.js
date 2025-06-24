const mongoose = require("mongoose");

const goodsReceiptSchema = new mongoose.Schema(
  {
    receiptDate: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    supplierName: {
      type: String,
      required: [true, "Nama supplier wajib diisi."],
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang tujuan wajib diisi."],
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
          type: mongoose.Schema.Types.ObjectId,
          ref: "Zone",
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Canceled"],
        message: "Status tidak valid. Pilihan: Pending, Completed, Canceled.",
      },
      default: "Completed",
    },
    type: {
      type: String,
      default: "Receiving",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsReceipt", goodsReceiptSchema);
