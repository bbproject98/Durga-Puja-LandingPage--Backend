const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { validateLeadInput } = require("../middlewares/validateRequest");

// POST /api/leads - Create new lead from Login / Lead Capture Modal
router.post("/", validateLeadInput, leadController.createLead);

// GET /api/leads - Retrieve all leads (for admin dashboard / audit)
router.get("/", leadController.getLeads);

// PATCH /api/leads/:id/status - Update lead status (e.g. NEW, CONTACTED, CONVERTED)
router.patch("/:id/status", leadController.updateLeadStatus);

// PUT or PATCH /api/leads/:id - Update lead details
router.put("/:id", leadController.updateLead);
router.patch("/:id", leadController.updateLead);

// DELETE /api/leads/:id - Delete lead
router.delete("/:id", leadController.deleteLead);

module.exports = router;

