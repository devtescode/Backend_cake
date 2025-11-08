const orderModel = require("../Models/order.model");

module.exports.getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Get all user's orders sorted by latest
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    console.log(orders, "user orders");

    // 2️⃣ Total Orders (count of orders)
    const totalOrders = orders.length;

    // 3️⃣ Total Spent (sum of all items or single order)
    const totalSpent = orders.reduce((sum, order) => {
      const orderTotal = order.items
        ? order.items.reduce((s, i) => s + i.price * i.quantity, 0)
        : order.price * (order.quantity || 0);
      return sum + orderTotal;
    }, 0);

    // 4️⃣ Active Orders (sum of quantities not delivered/cancelled)
    const activeOrders = orders.reduce((sum, order) => {
      const status = order.status?.toLowerCase() || '';
      if (status !== "delivered" && status !== "cancelled") {
        return sum + (order.quantity || 1);
      }
      return sum;
    }, 0);

    // 5️⃣ Total Quantity (sum of all quantities regardless of status)
    const totalQuantity = orders.reduce((sum, order) => sum + (order.quantity || 1), 0);

    // 6️⃣ Recent Orders (limit to 3)
    const recentOrders = orders.slice(0, 3).map(order => ({
      _id: order._id,
      name: order.name,
      price: order.price,
      quantity: order.items
        ? order.items.reduce((s, i) => s + i.quantity, 0)
        : (order.quantity || 1),
      status: order.status,
      cakeImage: order.image,
      createdAt: order.createdAt,
    }));

    res.json({
      totalOrders,
      totalSpent,
      activeOrders,
      totalQuantity,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};
