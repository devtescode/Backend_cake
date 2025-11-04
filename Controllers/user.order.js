const orderModel = require("../Models/order.model");
const planModels = require("../Models/plan.models");


module.exports.useraddorder = async (req, res) => {
  try {
    const { userId, planId, region, city, address } = req.body;

    if (!userId || !planId || !region || !city || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const plan = await planModels.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const newOrder = new orderModel({
      userId,
      planId,
      name: plan.name,
      image: plan.image,
      price: plan.price,
      region,
      city,
      address,
    });

    console.log(newOrder, "neworder");

    await newOrder.save();

    res.status(201).json({ message: "Order successfully created", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports.getuserorders = async (req, res) => {

  // Get all orders for a specific user
  // router.get("/getorders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
  // });

}


module.exports.getallorders = async (req, res) => {
  try {
    const orders = await orderModel.find()
      .populate("userId", "fullname email phonenumber") // ensure user field references User model
      .sort({ createdAt: -1 });
    res.json(orders);
    console.log(orders, "order");
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }

}

module.exports.settleorders = async (req, res) => {
   try {
    const order = await orderModel.findByIdAndUpdate(
      req.params.id,
      { status: "Delivered" },
      { new: true }
    );
    console.log(order, "deliver");
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
}