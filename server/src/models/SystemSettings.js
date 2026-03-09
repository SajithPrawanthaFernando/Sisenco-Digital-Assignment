const mongoose = require("mongoose");

const SystemSettingsSchema = new mongoose.Schema({
  categories: [
    {
      name: { type: String, required: true, unique: true },
      defaultLimit: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);
