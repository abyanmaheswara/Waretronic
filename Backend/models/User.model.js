const mongoose = require("mongoose");
const validator = require("validator"); // Import library validator untuk validasi email

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username wajib diisi."],
      unique: true,
      trim: true,
      lowercase: true, // Menyimpan username dalam huruf kecil
      minlength: [3, "Username minimal 3 karakter."],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Format email tidak valid.",
      },
    },
    password_hash: {
      type: String,
      required: [true, "Password wajib diisi."],
      minlength: [6, "Password minimal 6 karakter."],
    },
    role: {
      type: String,
      enum: {
        values: ["System Admin", "Warehouse Admin", "Staf Ahli"],
        message: "Role tidak valid. Pilihan: System Admin, Warehouse Admin, Staf Ahli.",
      },
      required: [true, "Role wajib diisi."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tanggal_daftar: {
      type: Date,
      default: Date.now,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
