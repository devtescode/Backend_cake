const orderModel = require("../Models/order.model");

module.exports.getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    // PAID statuses
    const paidStatuses = ["Success", "Delivered"];

    // PENDING statuses
    const pendingStatuses = ["Pending", "Cancelled"];

    let totalPaidAmount = 0;
    let totalPaidQuantity = 0;

    let totalPendingAmount = 0;
    let totalPendingQuantity = 0;

    orders.forEach(order => {
      const status = order.status?.toLowerCase();
      const qty = order.quantity || 1;
      const price = order.price || 0;

      const amount = price * qty;

      // PAID = Success or Delivered
      const isPaidStatus = ["success", "delivered"].includes(status);

      // PENDING = Pending, Processing, Cancelled
      const isPendingStatus = ["pending", "processing", "cancelled"].includes(status);

      if (isPaidStatus) {
        totalPaidAmount += amount;
        totalPaidQuantity += qty;
      }

      if (isPendingStatus) {
        totalPendingAmount += amount;
        totalPendingQuantity += qty;
      }
    });


    const recentOrders = orders.map(order => ({
      _id: order._id,
      name: order.name,
      price: order.price,
      quantity: order.quantity,
      status: order.status,
      cakeImage: order.image,
      createdAt: order.createdAt,
    }));

    console.log(recentOrders, "recentorders");


    res.json({
      totalOrders: totalPaidQuantity,     // Or return separately if needed
      totalSpent: totalPaidAmount,
      totalQuantity: totalPendingQuantity,
      pendingAmount: totalPendingAmount,
      recentOrders,
    });
    console.log({
      totalOrders: totalPaidQuantity,
      totalSpent: totalPaidAmount,
      totalQuantity: totalPendingQuantity,
      pendingAmount: totalPendingAmount,
    });

  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// module.exports.getUserDashboard = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
//     console.log(orders, "user orders");

//     const totalOrders = orders.length;

//     const totalSpent = orders.reduce((sum, order) => {
//       const orderTotal = order.items
//         ? order.items.reduce((s, i) => s + i.price * i.quantity, 0)
//         : order.price * (order.quantity || 0);
//       return sum + orderTotal;
//     }, 0);

//     const activeOrders = orders.reduce((sum, order) => {
//       const status = order.status?.toLowerCase() || '';
//       if (status !== "delivered" && status !== "cancelled") {
//         return sum + (order.quantity || 1);
//       }
//       return sum;
//     }, 0);
//     const totalQuantity = orders.reduce((sum, order) => sum + (order.quantity || 1), 0);

//     const recentOrders = orders.map(order => ({
//       _id: order._id,
//       name: order.name,
//       price: order.price,
//       quantity: order.items
//         ? order.items.reduce((s, i) => s + i.quantity, 0)
//         : (order.quantity || 1),
//       status: order.status,
//       cakeImage: order.image,
//       createdAt: order.createdAt,
//     }));


//     res.json({
//       totalOrders,
//       totalSpent,
//       activeOrders,
//       totalQuantity,
//       recentOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching user dashboard:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
