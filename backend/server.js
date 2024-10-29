const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const qrcodeTerminal = require("qrcode-terminal");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const jwtSecret = "hello_world";

// Database
let transactions = [];
let users = [{ id: 1, name: "johndoe", balance: 1000.0 }];

// Middleware JWT authentication
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Routes
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.name === username);

  console.log(user);
  if (user && password === "password") {
    const token = jwt.sign(user, jwtSecret);
    res.json({ token });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.get("/user", authenticateJWT, (req, res) => {
  const user = users.find((u) => req.user.name === u.name);

  if (user) {
    res.json({ user });
  } else {
    res.status(401).send("User not found");
  }
});

app.get("/generate-qr", (req, res) => {
  const transactionId = transactions.length + 1;
  const amount = parseFloat(req.query.amount);

  const qrData = JSON.stringify({
    transactionId,
    amount,
  });

  transactions.push({ id: transactionId, status: "init", amount });

  qrcodeTerminal.generate(qrData, { small: true });

  qrcode.toDataURL(qrData, (err, url) => {
    if (err) {
      res.status(500).send("Error generating QR code");
    } else {
      res.json({ qrCode: url });
    }
  });
});

app.post("/process-payment", authenticateJWT, (req, res) => {
  const { transactionId } = req.body;

  const transaction = transactions.find((t) => t.id === transactionId);
  const tIndex = transactions.findIndex((t) => t.id === transactionId);

  if (!transaction) {
    return res.status(404).send("Transaction not found");
  }

  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  if (user.balance < transaction.amount) {
    return res.status(400).send("Insufficient funds");
  }

  user.balance -= transaction.amount;

  transactions[tIndex].userId = req.user.id;
  transactions[tIndex].status = "completed";

  res.json({ message: "Payment successful", user });
});

app.get("/transactions", authenticateJWT, (req, res) => {
  const t = transactions.filter((t) => req.user.id === t.userId);
  console.log(transactions);

  res.json({ transactions: t });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
