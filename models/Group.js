const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    members: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to update members count
groupSchema.methods.updateMembers = async function (newMembersCount) {
  this.members = newMembersCount;
  await this.save(); // Save updated group info
};

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
