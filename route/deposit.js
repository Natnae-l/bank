const express = require("express");
const router = express.Router();
const Bank = require("../model/account");

router.post("/deposit", async (req, res) => {
  try {
    const { amount, accountNumber } = req.body;
    console.log(req.body);

    if (!(amount && accountNumber))
      return res.status(400).send({ error: "Invalid input" });
    const account = await Bank.findOne({ accountNumber: accountNumber });

    if (!account) {
      let newAccount = await Bank.create({
        amount: amount,
        accountNumber: accountNumber,
      });

      return res
        .status(201)
        .send({ message: "Account created successfully", payload: newAccount });
    }
    account = { ...account, amount: account.amount + amount };
    await account.save();

    res
      .status(200)
      .send({ message: "Account credited successfully", payload: account });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" + error.message });
  }
});

router.patch("/transfer", async (req, res) => {
  try {
    const { amount, senderId, receiverId, gatewayId } = req.body;

    if (!(amount && senderId && receiverId && gatewayId))
      return res.status(400).send({ error: "Bad request" });

    if (gatewayId != process.env.gatewayId)
      return res.status(401).send({ error: "unauthorized gateway" });

    let sender = await Bank.findOne({ accountNumber: senderId });

    if (!sender) return res.status(400).send({ error: "Unavailable account" });

    if (sender.amount < amount)
      return res.status(400).send({ error: "Inadequate finance" });

    let receiver = await Bank.findOne({ accountNumber: receiverId });

    if (!receiver)
      return res.status(400).send({ error: "Unavailable account" });

    sender.amount = sender.amount - amount;
    receiver.amount = receiver.amount + amount;

    console.log(sender, receiver);

    await sender.save();
    await receiver.save();

    res.status(200).send({ message: "Transaction processed successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" + error.message });
  }
});

module.exports = router;
