const orderModel = require("../Models/order.model");
const { Userschema } = require("../Models/user.models");
module.exports.userprofileupdate = async (req, res) => {
    console.log("scewcnklecfeqklcfq");

    try {
        const { userId } = req.params;

        // Get user profile
        const user = await Userschema.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get user orders
        const orders = await orderModel.find({ userId });

        let totalPaidAmount = 0;
        let totalPaidQuantity = 0;
        let totalPendingAmount = 0;
        let totalPendingQuantity = 0;

        orders.forEach(order => {
            const amount = (order.price || 0) * (order.quantity || 1);

            if (order.isPaid && ["Success", "Delivered"].includes(order.status)) {
                totalPaidAmount += amount;
                totalPaidQuantity += order.quantity || 1;
            } else if (!order.isPaid && ["Pending", "Processing"].includes(order.status)) {
                totalPendingAmount += amount;
                totalPendingQuantity += order.quantity || 1;
            }
        });

        res.json({
            profile: {
                fullName: user.fullname,       // map 'fullname' → 'fullName'
                email: user.email,
                phone: user.phonenumber,       // map 'phonenumber' → 'phone'
                address: user.address || '',
                bio: user.bio || '',
                profileImage: user.profileImage || "",
                createdAt: user.createdAt,
            },
            stats: {
                totalOrders: totalPaidQuantity,
                totalSpent: totalPaidAmount,
                pendingQuantity: totalPendingQuantity,
                pendingAmount: totalPendingAmount
            }
        });



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}





