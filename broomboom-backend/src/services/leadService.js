const prisma = require("../config/db");

const promoteCustomerLeadsToLoyal = async (phone) => {
  const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);
  if (cleanPhone.length >= 10) {
    try {
      await prisma.lead.updateMany({
        where: {
          phone: { contains: cleanPhone },
          status: { not: "LOYAL" },
        },
        data: {
          status: "LOYAL",
        },
      });
    } catch (err) {
      console.warn("Could not promote leads to LOYAL:", err.message);
    }
  }
};

const createLead = async (data) => {
  const { name, phone, email, context, action } = data;
  
  // FIX: Default to an empty string instead of null to prevent Prisma P2011 error
  let cleanEmail = ""; 
  if (email && typeof email === "string") {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && trimmed !== "null" && trimmed !== "undefined") {
      cleanEmail = trimmed;
    }
  }

  const rawPhone = String(phone || "").trim();
  const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);

  // Default status for first-time visitors
  let calculatedStatus = "NEW";

  if (cleanPhone.length >= 10) {
    // 1. Strictly check for PREVIOUS successful/paid bookings to determine LOYAL status
    const loyalBooking = await prisma.booking.findFirst({
      where: {
        customerPhone: { contains: cleanPhone },
        OR: [
          // Payment confirmed / completed
          { paymentStatus: { in: ["PAID", "paid", "Paid"] } },
          { status: { in: ["CONFIRMED", "confirmed", "Confirmed", "COMPLETED", "completed", "Completed"] } },
          // Pay later / COD
          { paymentStatus: { in: ["PAY_LATER", "pay_later", "COD", "cod"] } },
          { status: { in: ["PAY_LATER", "pay_later"] } },
        ],
      },
    });

    if (loyalBooking) {
      // User is a past paying customer
      calculatedStatus = "LOYAL";
      await promoteCustomerLeadsToLoyal(cleanPhone);
    } else {
      // 2. If NOT loyal, check if they have searched before in the Leads table
      const existingLead = await prisma.lead.findFirst({
        where: { phone: { contains: cleanPhone } },
      });

      if (existingLead) {
        // They visited and searched before. We will label this new row as "EXISTING"
        calculatedStatus = "EXISTING";
      }
    }
  }

  // 3. Create a BRAND NEW row every time, using the correct status
  const finalStatus =
    calculatedStatus === "LOYAL"
      ? "LOYAL"
      : data.status && data.status !== "NEW"
      ? data.status
      : calculatedStatus;

  return await prisma.lead.create({
    data: {
      name: (name || "Guest Traveler").trim(),
      phone: rawPhone,
      email: cleanEmail,
      context: context || "General Inquiry",
      action: action || "book",
      status: finalStatus,
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
  if (data.email !== undefined) {
    // FIX: Also applied the fix here to ensure no null values are sent on updates
    let cleanEmail = "";
    if (data.email && typeof data.email === "string") {
      const trimmed = data.email.trim().toLowerCase();
      if (trimmed && trimmed !== "null" && trimmed !== "undefined") {
        cleanEmail = trimmed;
      }
    }
    updateData.email = cleanEmail;
  }
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
  promoteCustomerLeadsToLoyal,
};