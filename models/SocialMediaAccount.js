const mongoose = require("mongoose");
const { decrypt } = require("../utils/encryption");
const {
  SchemaTypesReference,
} = require("../utils/Schemas/SchemaTypesReference");
const { EnumStringRequired } = require("../utils/Schemas");
const { PlatformArr } = require("../utils/SocialMedia/Platform");

const SocialPostingAccountSchema = new mongoose.Schema({
  platform: EnumStringRequired(PlatformArr),
  brand: mongoose.Types.ObjectId,
  token: { type: String, required: true },
});

// Decrypt the token stored in the account to retrieve email, password, and cookies
SocialPostingAccountSchema.methods.decryptDataOfToken = function () {
  const decryptedToken = decrypt(this.token);

  if (decryptedToken) {
    try {
      const tokenData = JSON.parse(decryptedToken);

      // Ensure cookies are parsed correctly
      const cookies = tokenData.cookies ? JSON.parse(tokenData.cookies) : [];

      return {
        email: tokenData.email,
        password: tokenData.password,
        cookies,
        client_id: tokenData.client_id,
        client_secret: tokenData.client_secret,
        pageID: tokenData.pageID,
        tokenPage: tokenData.tokenPage,
        longAccessToken: tokenData.longAccessToken,
      };
    } catch (error) {
      console.error("Error parsing decrypted token:", error);
      return null;
    }
  } else {
    console.error("Failed to decrypt token");
    return null;
  }
};

const Account = mongoose.model(
  SchemaTypesReference.SocialPostingAccount,
  SocialPostingAccountSchema
);

module.exports = Account;
