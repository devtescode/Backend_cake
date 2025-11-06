const { Userschema } = require("../Models/user.models");

module.exports.admingetallusers = async (req, res) => {
    try {
        const users = await Userschema.find().sort({ createdAt: -1 });
        res.status(200).json(users);
        console.log(users, "users");
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
}