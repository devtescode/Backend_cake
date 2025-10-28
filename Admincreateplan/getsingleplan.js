const planModels = require("../Models/plan.models");

module.exports.getsingleplan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await planModels.findById(id);
    console.log(plan, "single plan on user side");
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ message: "Server error" });
  }
};