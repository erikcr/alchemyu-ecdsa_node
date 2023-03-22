const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "040e93b46568b1e77a462433ceeb71a72f64992402eb9f141f6917f2ea49e999ab4ea67f76b1d027642c636f56aca7717acde76c8a9e249cb9999f2954db530c6a": 100,
  "045d4ea5c5686cc059834d57b11a0eeb09891781c4ef4a6b9dc785fd8525bafe99c28d0f7e01835dfefcd04caba8f8dc3c0afcf7f0d5d99a561da788d80dd65ad8": 50,
  "044a1fa809c9ea4dfc482cbba8415c23e34ed6a5baa0e04037af8b24ae40e47ae32000400011892df820ca150b5fc7c54e9b32fa5e2ccca07b11caeaa9d828fe6f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;

  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recoveryBit, message, recipient } = req.body;

  const hashMsg = keccak256(utf8ToBytes(message));
  const recoveredKey = secp.recoverPublicKey(hashMsg, hexToBytes(signature), recoveryBit);
  const senderAddress = toHex(recoveredKey);
  
  setInitialBalance(senderAddress);
  setInitialBalance(recipient);

  const amount = parseInt(message);

  if (balances[senderAddress] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[senderAddress] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[senderAddress] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
