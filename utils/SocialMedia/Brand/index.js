const PlatformEnum = {
  TWITTER: "TWITTER",
  FACEBOOK: "FACEBOOK",
  LINKEDIN: "LINKEDIN",
  REDDIT: "REDDIT",
  TELEGRAM: "TELEGRAM",
};

const PlatformArr = Object.values(PlatformEnum);

// Exporting using CommonJS syntax
module.exports = { PlatformArr, PlatformEnum };
