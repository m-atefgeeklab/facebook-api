const nicheListEnum = {
    politics: "politics",
    entertainment: "entertainment",
    finance: "finance",
};

const nicheListArr = Object.values(nicheListEnum);

// Exporting using CommonJS syntax
module.exports = { nicheListArr, nicheListEnum };
