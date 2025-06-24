const Zone = require("../models/Zone.model");

const createZone = async (req, res) => {
  try {
    const zone = new Zone(req.body);
    await zone.save();
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().populate("warehouse", "name");
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate("warehouse", "name");
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    res.json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    res.json({ message: "Zone deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⬇️ Harus di bagian bawah, setelah semua fungsi didefinisikan
module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
};
