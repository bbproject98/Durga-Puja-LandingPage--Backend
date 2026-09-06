const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { validateLeadInput } = require("../middlewares/validateRequest");

// POST /api/leads - Create new lead from Login / Lead Capture Modal
router.post("/", validateLeadInput, leadController.createLead);

// GET /api/leads - Retrieve all leads (for admin dashboard / audit)
router.get("/", leadController.getLeads);

module.exports = router;

