const mongoose = require("mongoose");

const goodsIssueSchema = new mongoose.Schema(
  {
    issueDate: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Nama customer wajib diisi."],
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang sumber wajib diisi."],
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
      default: "Outbound",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsIssue", goodsIssueSchema);
