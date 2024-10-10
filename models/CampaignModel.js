const mongoose = require("mongoose");
const {
  SchemaTypesReference,
} = require("../utils/Schemas/SchemaTypesReference");
const { EnumStringRequired } = require("../utils/Schemas");
const { PlatformArr } = require("../utils/SocialMedia/Platform");

// Define the schema
const CampaignSchema = new mongoose.Schema({
  content: {
    type: String,
    required: false,
    trim: true,
  },
  platform: EnumStringRequired(PlatformArr),
  timestamp: {
    type: Number,
    required: false,
    trim: true,
  },
  engagment: {
    type: Number,
    required: true,
    default: 0,
  },
  posts_shared: {
    type: Number,
    required: true,
    default: 0,
  },
  brand: {
    type: mongoose.Types.ObjectId,
    required: true,
    trim:true
  },
  status: {
    type: String,
    required: false,
    trim: true,
  },
});
// Create the model
const Campaign = mongoose.model(SchemaTypesReference.Campaigns, CampaignSchema);

// Export the model
module.exports = Campaign;
