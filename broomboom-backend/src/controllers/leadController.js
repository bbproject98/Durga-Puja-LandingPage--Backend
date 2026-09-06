const leadService = require("../services/leadService");

const createLead = async (req, res, next) => {
  try {
    const newLead = await leadService.createLead(req.body);
    return res.status(201).json({
      success: true,
      message: "Lead recorded successfully.",
      data: newLead,
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const leads = await leadService.getAllLeads();
    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required.",
      });
    }

    const updated = await leadService.updateLeadStatus(id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await leadService.updateLead(id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await leadService.deleteLead(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
  updateLead,
  deleteLead,
};

