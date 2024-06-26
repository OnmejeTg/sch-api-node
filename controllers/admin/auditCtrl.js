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

const getSingleAudit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const audit = await Audit.findById(id);
    if (!audit) {
        res.status(404).json({ message: "Audit not found" });
    } else {
        res.status(200).json({
            status: "success",
            message: "Audit was successfully found",
            data: audit,
        });
    }
})

const deleteAudit = asyncHandler(async(req, res)=>{
    const { id } = req.params;
    const deletedAudit = await Audit.findByIdAndDelete(id);
    if (!deletedAudit) {
        res.status(404).json({ message: "Audit not found" });
    } else {
        res.status(200).json({
            status: "success",
            message: "Audit was successfully deleted",
            data: deletedAudit,
        });
    }
})




export {
    createAudit,
    getAudit,
    getSingleAudit,
    deleteAudit
}