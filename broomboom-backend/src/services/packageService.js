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

module.exports = {
  getAllPackages,
  getPackageById,
};

