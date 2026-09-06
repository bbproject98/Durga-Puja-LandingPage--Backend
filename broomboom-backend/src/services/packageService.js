const prisma = require("../config/db");

const getAllPackages = async (type) => {
  const whereClause = type ? { type } : {};
  const packages = await prisma.package.findMany({
    where: whereClause,
  });

  return packages.map((pkg) => ({
    ...pkg,
    highlights: typeof pkg.highlights === "string" ? JSON.parse(pkg.highlights) : pkg.highlights,
  }));
};

const getPackageById = async (id) => {
  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) return null;

  return {
    ...pkg,
    highlights: typeof pkg.highlights === "string" ? JSON.parse(pkg.highlights) : pkg.highlights,
  };
};

const savePackage = async (data) => {
  const id = data.id || `pkg_${Date.now()}`;
  const payload = {
    type: data.type || "rental",
    title: data.title,
    subtitle: data.subtitle || null,
    hoursKm: data.hoursKm || null,
    rentalType: data.rentalType || null,
    distance: data.distance || null,
    estimatedTime: data.estimatedTime || null,
    priceStarting: Number(data.priceStarting) || 2499,
    badge: data.badge || "Popular",
    optimalTime: data.optimalTime || null,
    highlights: typeof data.highlights === "object" ? JSON.stringify(data.highlights) : (data.highlights || "[]"),
    image: data.image || "",
  };

  return await prisma.package.upsert({
    where: { id },
    update: payload,
    create: { id, ...payload },
  });
};

const deletePackage = async (id) => {
  if (!id) return null;
  return await prisma.package.delete({
    where: { id },
  });
};

module.exports = {
  getAllPackages,
  getPackageById,
  savePackage,
  deletePackage,
};

