const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

module.exports = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, authorization denied." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = await User.findById(decoded.userId).select("-password_hash");
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Token is valid, but user not found or inactive." });
    }
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token. Authorization denied." });
    }
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Server error during authentication." });
  }
};
