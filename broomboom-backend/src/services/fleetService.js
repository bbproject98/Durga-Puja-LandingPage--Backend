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

const saveVehicle = async (data) => {
  const id = data.id || `veh_${Date.now()}`;
  const payload = {
    name: data.name,
    models: data.models,
    seats: Number(data.seats) || 4,
    luggage: data.luggage || "2 Bags",
    category: data.category || "sedan",
    tag: data.tag || "",
    badgeType: data.badgeType || "gold",
    image: data.image || "",
    basePrice: Number(data.basePrice) || 0,
    baseHours: Number(data.baseHours) || 8,
    baseKm: Number(data.baseKm) || 80,
    nightPrice: Number(data.nightPrice) || 0,
    perExtraHour: Number(data.perExtraHour) || 0,
    outstationPerKm: Number(data.outstationPerKm) || 0,
    features: typeof data.features === "object" ? JSON.stringify(data.features) : (data.features || "[]"),
    inclusions: typeof data.inclusions === "object" ? JSON.stringify(data.inclusions) : (data.inclusions || "[]"),
    exclusions: typeof data.exclusions === "object" ? JSON.stringify(data.exclusions) : (data.exclusions || "[]"),
  };

  return await prisma.fleet.upsert({
    where: { id },
    update: payload,
    create: { id, ...payload },
  });
};

const deleteVehicle = async (id) => {
  if (!id) return null;
  return await prisma.fleet.delete({
    where: { id },
  });
};

module.exports = {
  getAllFleet,
  getVehicleById,
  saveVehicle,
  deleteVehicle,
};

