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

module.exports = {
  createLead,
  getLeads,
};

