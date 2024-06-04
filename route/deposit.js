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

/**
 * @swagger
 * /deposit:
 *   post:
 *     summary: Deposit amount to account
 *     description: Endpoint to deposit an amount to a bank account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be deposited
 *               accountNumber:
 *                 type: string
 *                 description: The account number to which the amount will be deposited
 *     responses:
 *       '201':
 *         description: Account created successfully or amount credited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account created successfully or Account credited successfully
 *                 payload:
 *                   type: object
 *                   description: The account details with updated balance
 *       '400':
 *         description: Invalid input or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input or Bad request
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 * /transfer:
 *   patch:
 *     summary: Transfer amount between accounts
 *     description: Endpoint to transfer an amount between two bank accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be transferred
 *               senderId:
 *                 type: string
 *                 description: The account number of the sender
 *               receiverId:
 *                 type: string
 *                 description: The account number of the receiver
 *               gatewayId:
 *                 type: string
 *                 description: The gateway identifier for authorization
 *     responses:
 *       '200':
 *         description: Transaction processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction processed successfully
 *       '400':
 *         description: Bad request or unavailable account or inadequate finance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad request or Unavailable account or Inadequate finance
 *       '401':
 *         description: Unauthorized gateway
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized gateway
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
