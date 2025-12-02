const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetAudience: { type: String, enum: ["All Users", "Selected Users"], required: true },
  selectedUsers: { type: [String], default: [] }, // array of user IDs
  date: { type: Date, default: Date.now },
  readBy: { type: [String], default: [] } // users who have read this notification
});

module.exports = mongoose.model("Notification", NotificationSchema);
