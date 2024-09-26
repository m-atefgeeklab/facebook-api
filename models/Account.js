const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

// Map of specific emails to brands
const emailToBrandMap = {
  "andrewgeeklab@gmail.com": "PST",
  "john@yahoo.com": "Cool",
  "sara@example.com": "Awesome",
};

// Account schema
const accountSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      default: "Unknown",
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password and set brand based on email before saving
accountSchema.pre('save', async function (next) {
  try {
    // If the password is modified, hash it
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    
    // Set the brand based on the email
    if (this.isModified('email')) {
      this.brand = emailToBrandMap[this.email] || "Unknown";
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Account model
const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
