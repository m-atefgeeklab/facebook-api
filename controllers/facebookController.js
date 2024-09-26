const Account = require("../models/Account");
const Group = require("../models/Group");

exports.createAccount = async (req, res) => {
  const { brand, email, password } = req.body;
  const account = new Account({
    brand,
    email,
    password,
  });
  try {
    const accountData = await account.save();
    res.status(201).json(accountData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  const { name, members, account } = req.body;
  const group = new Group({
    name,
    members,
    account,
  });
  try {
    const groupData = await group.save();
    res.status(201).json(groupData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
