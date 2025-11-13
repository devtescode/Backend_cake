const orderModel = require("../Models/order.model");
module.exports.markOrderAsDelivered = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If user has paid, mark as delivered; else still deliver but keep flag
    order.status = order.isPaid ? "Delivered" : "Awaiting Payment";
    await order.save();

    res.json({ message: "Order delivery updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as delivered" });
  }
};


// GET: settled orders
module.exports.settledorders = async (req, res) => {
    try {
        const settled = await orderModel
            .find({ status: "Delivered" })
            .populate("userId", "fullname email phonenumber");
        res.json(settled);
        console.log(settled, "settled order");

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch settled orders" });
    }
}

module.exports.deliveredgroup = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "No order IDs provided" });
    }

    const orders = await orderModel.find({ _id: { $in: orderIds } });

    const updates = orders.map((order) => ({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            status: order.isPaid ? "Delivered" : "Awaiting Payment",
          },
        },
      },
    }));

    await orderModel.bulkWrite(updates);

    res.status(200).json({ message: "Selected orders updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark orders as delivered" });
  }
};

