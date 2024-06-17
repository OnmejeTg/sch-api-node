import Audit from "../models/audit.js";
import User from "../models/user.js";

const createAuditLog = async (userId, action, model, description) => {
  try {
    const authenticatedUser = await User.findById(userId);
    if (!authenticatedUser) {
      throw new Error("Authenticated user not found");
    }

    const auditLog = new Audit({
      action,
      model,
      description: `${authenticatedUser.surname} ${description}`,
      createdBy: userId,
    });

    await auditLog.save();
    console.log("Audit log saved successfully");
  } catch (error) {
    console.error("Failed to create audit log:", error.message);
  }
};

export default createAuditLog;
