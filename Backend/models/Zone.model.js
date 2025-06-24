const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama zona wajib diisi."],
      trim: true,
      minlength: [1, "Nama zona minimal 1 karakter."],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Gudang wajib diisi."],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", zoneSchema);
