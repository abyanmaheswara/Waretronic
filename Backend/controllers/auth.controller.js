const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user baru
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Mengubah nama_lengkap jadi email

    // Validasi input
    if (!username || !email || !password || !role) {
      // Menambah email di validasi
      return res.status(400).json({ error: "Semua field wajib diisi (username, email, password, role)" });
    }

    // Cek apakah username atau email sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "Username atau Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat dan simpan user baru
    const newUser = new User({
      username,
      email, // Menambah email ke model
      role,
      password_hash: hashedPassword,
      isActive: true, // Default user baru aktif
    });

    await newUser.save();

    res.status(201).json({ message: "Registrasi user berhasil", user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, isActive: newUser.isActive } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat registrasi" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    // Bandingkan password yang dimasukkan dengan hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    // Cek status isActive
    if (!user.isActive) {
      return res.status(403).json({ error: "Akun tidak aktif. Hubungi administrator." });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Buat token JWT
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "2h" });

    // Kirim response login
    res.json({
      message: "Login berhasil",
      token,
      username: user.username,
      email: user.email || "",
      role: user.role,
      isActive: user.isActive, // Tambahkan isActive
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat login" });
  }
};
// exports.getUsers
// Di auth.controller.js
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash"); // Jangan kirim hash password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getUserById (untuk edit)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password_hash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.updateUser
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, isActive, password } = req.body;
    const updateData = { username, email, role, isActive };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password_hash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.deleteUser
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.resetPassword (untuk admin)
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body; // Admin provide new temporary password

    if (!newPassword) return res.status(400).json({ error: "New password is required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password_hash: hashedPassword }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
