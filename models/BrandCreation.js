const mongoose = require("mongoose");
const { nicheListArr } = require("../utils/SocialMedia/niche");
const {
  SchemaTypesReference,
} = require("../utils/Schemas/SchemaTypesReference");
const { EnumStringRequired } = require("../utils/Schemas");

// Define the schema
const options = { discriminatorKey: "type" };

const BrandSchema = new mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    aquisition_date: {
      type: Date,
      required: true,
      unique: false,
    },

    niche: EnumStringRequired(nicheListArr),
  },
  options
);

const SubBrandSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Types.ObjectId,
    ref: SchemaTypesReference.Brands,
    required: true,
  },
});

const BrandsModel = mongoose.model(SchemaTypesReference.Brands, BrandSchema);

// Create the SubBrand model as a discriminator of Brand
const SubBrandModel = BrandsModel.discriminator("subbrand", SubBrandSchema);

module.exports = {
  BrandsModel,
  SubBrandModel,
};
