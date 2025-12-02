// const express = require("express");
// const router = express.Router();
const Notification = require("../Models/notification");
const { Userschema } = require("../Models/user.models");
// const User = require("../models/user.models");

// SEND NOTIFICATION
module.exports.sendNotification = async (req, res) => {
    try {
        const { title, message, targetAudience, selectedUsers } = req.body;

        if (!title || !message || !targetAudience) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // If Target = Selected Users but none selected
        if (targetAudience === "Selected Users" && (!selectedUsers || selectedUsers.length === 0)) {
            return res.status(400).json({ message: "No users selected" });
        }

        const notification = new Notification({
            title,
            message,
            targetAudience,
            selectedUsers: targetAudience === "Selected Users" ? selectedUsers : [],
        });
        console.log(notification, "notification");
        

        await notification.save();

        res.status(201).json({ message: "Notification sent", notification });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}


module.exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await Userschema.find().select("_id fullname email phonenumber");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};


module.exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });

  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};


// GET notifications for a user
module.exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch notifications sent to all users OR to this specific user
    const notifications = await Notification.find({
      $or: [
        { targetAudience: "All Users" },
        { selectedUsers: userId }
      ]
    }).sort({ date: -1 }); // newest first

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Mark notification as read
module.exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // notification id
    const { userId } = req.body; // current logged-in user id

    if (!userId) return res.status(400).json({ message: "User ID missing" });

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    // Add userId to readBy if not already there
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
