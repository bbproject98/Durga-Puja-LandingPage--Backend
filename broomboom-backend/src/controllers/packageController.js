const packageService = require("../services/packageService");

const getPackages = async (req, res, next) => {
  try {
    const { type } = req.query; // "rental" or "outstation"
    const packages = await packageService.getAllPackages(type);
    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

const getPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: `Package with id '${id}' not found.`,
      });
    }
    return res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

const savePackage = async (req, res, next) => {
  try {
    const saved = await packageService.savePackage(req.body);
    return res.status(200).json({
      success: true,
      message: "Package saved successfully.",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await packageService.deletePackage(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Package with id '${id}' not found.`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Package deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPackages,
  getPackage,
  savePackage,
  deletePackage,
};

