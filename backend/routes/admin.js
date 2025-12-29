const express = require("express");
const router = express.Router();
const { Member, Class, Equipment } = require("../database");

// Get Dashboard Stats
router.get("/stats", async (req, res) => {
  try {
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { status: "Active" } });

    res.json({
      totalMembers,
      dailyCheckIns: 342, // Still mock for now
      revenue: "45.2k", // Still mock
      activeMembers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Member Management
router.get("/members", async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/members", async (req, res) => {
  try {
    const newMember = await Member.create({
      ...req.body,
      password: "password", // Default
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Equipment Management
router.get("/equipment", async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule Management
router.get("/classes", async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
