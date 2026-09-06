const fleetService = require("../services/fleetService");

const getFleet = async (req, res, next) => {
  try {
    const { category } = req.query;
    const fleet = await fleetService.getAllFleet(category);
    return res.status(200).json({
      success: true,
      count: fleet.length,
      data: fleet,
    });
  } catch (error) {
    next(error);
  }
};

const getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await fleetService.getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with id '${id}' not found.`,
      });
    }
    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const saveVehicle = async (req, res, next) => {
  try {
    const saved = await fleetService.saveVehicle(req.body);
    return res.status(200).json({
      success: true,
      message: "Vehicle saved successfully.",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await fleetService.deleteVehicle(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with id '${id}' not found.`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFleet,
  getVehicle,
  saveVehicle,
  deleteVehicle,
};

