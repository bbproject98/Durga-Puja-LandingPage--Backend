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

const updateLeadStatus = async (id, status) => {
  if (!id || !status) return null;
  const existing = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existing) return null;

  return await prisma.lead.update({
    where: { id },
    data: { status },
  });
};

const updateLead = async (id, data) => {
  if (!id) return null;
  const existing = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existing) return null;

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.phone !== undefined) updateData.phone = data.phone.trim();
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.context !== undefined) updateData.context = data.context;
  if (data.action !== undefined) updateData.action = data.action;
  if (data.status !== undefined) updateData.status = data.status;

  return await prisma.lead.update({
    where: { id },
    data: updateData,
  });
};

const deleteLead = async (id) => {
  if (!id) return null;
  const existing = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existing) return null;

  return await prisma.lead.delete({
    where: { id },
  });
};

module.exports = {
  createLead,
  getAllLeads,
  updateLeadStatus,
  updateLead,
  deleteLead,
};

