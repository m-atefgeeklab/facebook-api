const mongoose = require("mongoose");
const {
  SchemaTypesReference,
} = require("../utils/Schemas/SchemaTypesReference");
const { EnumStringRequired } = require("../utils/Schemas");
const { PlatformArr } = require("../utils/SocialMedia/Platform");

// Define the schema
const SocialMediaGroupsSchema = new mongoose.Schema({
  group_name: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
  group_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subscribers: {
    type: Number,
    required: true,
    default: 0,
  },
  niche: {
    type: String,
    required: false,
    trim: true,
  },

  platform: EnumStringRequired(PlatformArr),

  brand: {
    type: String,
    required: true,
    trim: true,
  },

  engagement: {
    type: Number,
    required: false,
    default: 0,
  },
});

// Create the model
const Group = mongoose.model(
  SchemaTypesReference.SocialMediaGroups,
  SocialMediaGroupsSchema
);

module.exports = Group;
