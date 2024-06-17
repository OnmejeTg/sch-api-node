import Audit from "../../models/audit.js";
import asyncHandler from "express-async-handler";


const createAudit = asyncHandler(async (req, res) => {
    const newAudit = new Audit(req.body);
    await newAudit.save();
    res.status(200).json({
        status: "success",
        message: "Audit created successfully",
        data: newAudit,
    })
})

const getAudit = asyncHandler(async (req, res) => {
    const audits = await Audit.find();
    res.status(200).json({
        status: "success",
        message: "Audits were successfully found",
        data: audits,
    })
})




export {
    createAudit,
    getAudit
}