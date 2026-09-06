const prisma = require("../config/db");

const getAllFleet = async (category) => {
  const whereClause = category && category !== "all" ? { category } : {};
  const fleetItems = await prisma.fleet.findMany({
    where: whereClause,
  });

  // Parse JSON strings back to arrays for client consumption
  return fleetItems.map((item) => ({
    ...item,
    features: typeof item.features === "string" ? JSON.parse(item.features) : item.features,
    inclusions: typeof item.inclusions === "string" ? JSON.parse(item.inclusions) : item.inclusions,
    exclusions: typeof item.exclusions === "string" ? JSON.parse(item.exclusions) : item.exclusions,
  }));
};

const getVehicleById = async (id) => {
  const vehicle = await prisma.fleet.findUnique({
    where: { id },
  });

  if (!vehicle) return null;

  return {
    ...vehicle,
    features: typeof vehicle.features === "string" ? JSON.parse(vehicle.features) : vehicle.features,
    inclusions: typeof vehicle.inclusions === "string" ? JSON.parse(vehicle.inclusions) : vehicle.inclusions,
    exclusions: typeof vehicle.exclusions === "string" ? JSON.parse(vehicle.exclusions) : vehicle.exclusions,
  };
};

module.exports = {
  getAllFleet,
  getVehicleById,
};

