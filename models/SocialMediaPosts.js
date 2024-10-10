const mongoose = require("mongoose");
const {
  SchemaTypesReference,
} = require("../utils/Schemas/SchemaTypesReference");

// Define the schema
const SocialMediaPostsSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: false,
    trim: true,
  },

  content: {
    type: String,
    required: false,
    trim: true,
  },
  group_name: { type: String, required: false },

  group_id: { type: String, required: true, unique: false, trim: true },
  timestamp: {
    type: Number,
    required: true,
    default: 0,
  },
  platform: {
    type: String,
  },

  brand: {
    type: String,
    required: true,
    trim: true,
  },
});

// Create the model
const Post = mongoose.model(
  SchemaTypesReference.SocialMediaPosts,
  SocialMediaPostsSchema
);

module.exports = Post;
