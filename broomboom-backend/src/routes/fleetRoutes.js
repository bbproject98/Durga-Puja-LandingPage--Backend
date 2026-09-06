const express = require("express");
const router = express.Router();
const fleetController = require("../controllers/fleetController");

// GET /api/fleet - Get all vehicles (optional ?category=sedan|suv|traveller)
router.get("/", fleetController.getFleet);

// GET /api/fleet/:id - Get single vehicle by ID
router.get("/:id", fleetController.getVehicle);

module.exports = router;

