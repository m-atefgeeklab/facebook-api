const campaignListEnum = {
    AUTO_COMMENT: "Auto Comment",
    MUST_APPROVE: "Must Approve",
};

const campaignListArr = Object.values(campaignListEnum);

// Exporting using CommonJS syntax
module.exports = { campaignListArr, campaignListEnum };
