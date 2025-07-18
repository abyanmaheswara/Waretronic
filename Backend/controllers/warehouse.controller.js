const Warehouse = require("../models/Warehouse.model");

exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
