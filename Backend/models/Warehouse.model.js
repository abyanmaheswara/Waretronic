const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama gudang wajib diisi."],
      unique: true,
      trim: true,
      minlength: [2, "Nama gudang minimal 2 karakter."],
    },
    address: {
      type: String,
      trim: true,
    },
    capacity_total: {
      type: Number,
      default: 0,
      min: [0, "Kapasitas total tidak boleh negatif."],
    },
    capacity_used: {
      type: Number,
      default: 0,
      min: [0, "Kapasitas terpakai tidak boleh negatif."],
      validate: {
        validator: function (v) {
          return v <= this.capacity_total;
        },
        message: "Kapasitas terpakai tidak boleh melebihi kapasitas total.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    zones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
