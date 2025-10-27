const planModels = require("../Models/plan.models");
module.exports.admindelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await planModels.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting plan",
    });
  }
};
