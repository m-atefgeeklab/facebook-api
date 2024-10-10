const { Types } = require("mongoose");

const RequiredString = {
    type: String,
    required: true,
};

const RequiredUniqueString = {
    type: String,
    required: true,
    unique: true,
};

const NotRequiredString = {
    type: String,
    default: "",
};

const RequiredBoolean = {
    type: Boolean,
    required: true,
    default: false,
};

const RequiredNumber = {
    type: Number,
    required: true,
};

const RequiredSpecificNumber = (specificNumber) => {
    return {
        type: Number,
        required: true,
        default: specificNumber,
    };
};

const RequiredUniqueNumber = {
    type: Number,
    required: true,
    unique: true,
};

const NotRequiredNumber = {
    type: Number,
};

const RefType = (ref, required) => {
    return {
        type: Types.ObjectId,
        required,
        ref,
        default: null,
    };
};

const StringValidation = (validation, message) => {
    return {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return validation.test(v);
            },
            message,
        },
    };
};

const EnumStringRequired = (enumValues, index = 0) => {
    return {
        type: String,
        required: true,
        enum: enumValues,
        default: enumValues[index],
    };
};

const EnumStringNotRequired = (enumValues) => {
    return {
        type: String,
        required: false,
        enum: enumValues,
        default: null,
    };
};

// Exporting using CommonJS syntax
module.exports = {
    RequiredString,
    NotRequiredString,
    RequiredBoolean,
    RequiredNumber,
    NotRequiredNumber,
    RequiredUniqueString,
    RequiredUniqueNumber,
    RequiredSpecificNumber,
    RefType,
    StringValidation,
    EnumStringRequired,
    EnumStringNotRequired,
};
