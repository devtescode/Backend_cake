const { Userschema } = require("../Models/user.models");
const orderModel = require("../Models/order.model");

module.exports.getdashboardstatus = async (req, res) => {
  try {
    // ✅ Basic counts
    const totalUsers = await Userschema.countDocuments();
    const totalCakes = await orderModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalDeliveries = await orderModel.countDocuments({ status: "Delivered" });

    // ✅ Aggregate to get total revenue and total quantity
    const totalStats = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const totalRevenue = totalStats.length > 0 ? totalStats[0].totalRevenue : 0;
    const totalQuantity = totalStats.length > 0 ? totalStats[0].totalQuantity : 0;

    // ✅ Recent orders (latest 5)
    const recentOrders = await orderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullname email")
      .select("name price quantity status createdAt");

    // ✅ Send all data
    res.json({
      totalUsers,
      totalCakes,
      totalOrders,
      totalDeliveries,
      totalRevenue,
      totalQuantity, // 👈 Added total quantity here
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
