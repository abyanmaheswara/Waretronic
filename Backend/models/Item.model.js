const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU wajib diisi."],
      unique: true,
      trim: true,
      uppercase: true, // Menyimpan SKU dalam huruf besar
      minlength: [3, "SKU minimal 3 karakter."],
    },
    name: {
      type: String,
      required: [true, "Nama item wajib diisi."],
      trim: true,
      minlength: [2, "Nama item minimal 2 karakter."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Deskripsi maksimal 500 karakter."],
    },
    category: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit wajib diisi."],
      trim: true,
    },
    minimum: {
      type: Number,
      default: 0,
      min: [0, "Minimum stock tidak boleh negatif."],
    },
    variants: [
      {
        name: {
          type: String,
          trim: true,
        }, // Contoh: {name: "Red"} atau {name: "Large"}
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
