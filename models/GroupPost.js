const mongoose = require("mongoose");

const groupPostSchema = new mongoose.Schema(
  {
    postContent: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    postedBy: {
      type: String,
      required: true,
    },
    groupId: {
      type: String,
      ref: "Group",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", groupPostSchema);
module.exports = Post;
