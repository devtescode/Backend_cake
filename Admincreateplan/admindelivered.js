const orderModel = require("../Models/order.model");

// PUT: mark order delivered
// router.put("/orders/:id/delivered", async (req, res) => {
//   try {
//     const updated = await orderModel.findByIdAndUpdate(
//       req.params.id,
//       { status: "Delivered" },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to mark as delivered" });
//   }
// });

// Mark order as delivered
module.exports.markOrderAsDelivered = async (req, res) => {
    try {
        const updated = await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: "Delivered" },
            { new: true }
        );

        console.log(updated);


        if (!updated) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order marked as delivered", order: updated });
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

        await orderModel.updateMany(
            { _id: { $in: orderIds } },
            { $set: { status: "Delivered" } }
        );

        res.status(200).json({ message: "Selected orders marked as delivered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to mark orders as delivered" });
    }

}
