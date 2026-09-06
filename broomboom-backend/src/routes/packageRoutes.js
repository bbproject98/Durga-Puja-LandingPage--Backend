const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");

// GET /api/packages - Get all packages (optional ?type=rental|outstation)
router.get("/", packageController.getPackages);

// GET /api/packages/:id - Get package by ID
router.get("/:id", packageController.getPackage);

// POST /api/packages - Create or update package
router.post("/", packageController.savePackage);

// DELETE /api/packages/:id - Delete package
router.delete("/:id", packageController.deletePackage);

module.exports = router;

