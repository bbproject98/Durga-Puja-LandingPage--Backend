const prisma = require("../config/db");

const createLead = async (data) => {
  const { name, phone, email, context, action } = data;
  return await prisma.lead.create({
    data: {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      context: context || "General Inquiry",
      action: action || "book",
    },
  });
};

const getAllLeads = async () => {
  return await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  createLead,
  getAllLeads,
};

