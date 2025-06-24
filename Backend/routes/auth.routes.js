const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth"); // Impor middleware auth

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes for User Management (requires authentication)
// Semua rute di bawah ini HARUS dilindungi dengan middleware authMiddleware
router.get("/users", authMiddleware, authController.getUsers);
router.get("/users/:id", authMiddleware, authController.getUserById);
router.put("/users/:id", authMiddleware, authController.updateUser);
router.delete("/users/:id", authMiddleware, authController.deleteUser);
router.put("/users/:id/reset-password", authMiddleware, authController.resetPassword);

module.exports = router;
