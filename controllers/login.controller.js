const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sessions = require("../store/sessions.store");
const filePath = path.join(__dirname, "../data/usersData.json");
const users = require(filePath);

exports.login = async (req, res) => {
  const { id, username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password required.");
  }

  const existingUser = users.find((u) => u.username === username);
  if (!existingUser) {
    return res.status(401).send("Invalid username or password.");
  }

  const validPassword = await bcrypt.compare(password, existingUser.password);
  if (!validPassword) {
    return res.status(401).send("Invalid username or password.");
  }

  const sessionId = crypto.randomUUID();

  sessions[sessionId] = {
    userId: existingUser.id,
    username: existingUser.username,
  };

  res.cookie("sessionId", sessionId, { httpOnly: true });

  res.status(200).json(`Welcome back, ${username}`);
};
