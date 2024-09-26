const mongoose = require("mongoose");

const BASE_URL = process.env.AWS_BASE_URL;

const groupPostSchema = new mongoose.Schema(
  {
    postContent: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      // Custom setter to prepend the BASE_URL
      set: function (images) {
        return images.map((image) => `${BASE_URL}/${image}`);
      },
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
