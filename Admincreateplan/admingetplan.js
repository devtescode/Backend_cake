const planModels = require("../Models/plan.models");

module.exports.admingetplan = async (req, res) => {
    try {
        const plans = await planModels.find().sort({ createdAt: -1 }); // latest first
        console.log(plans, "plans");
        
        return res.status(200).json({
            success: true,
            plans: plans
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
}

