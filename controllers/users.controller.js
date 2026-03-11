const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../data/usersData.json");
const users = require(filePath);

exports.createUser = (req, res) => {
  const { id, username, passwordHash } = req.body;

  if (!id || !username || !passwordHash) {
    return res
      .status(400)
      .send("'id', 'username', and 'passwordHash' fields are required.");
  }

  users.push(req.body);

  fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      users.pop();
      return res.status(500).send("Failed to save user");
    }

    return res.status(200).send(`${username} has been successfully added`);
  });
};

exports.getAllUsers = (req, res) => {
  res.status(200).json(users);
};

exports.getUser = (req, res) => {
  const targetUser = users.find((u) => String(u.id) === req.params.id);

  if (!targetUser) {
    return res.status(404).send("User not found.");
  }

  return res.status(200).json(targetUser);
};

exports.updateUser = (req, res) => {
  const existingUser = users.find((user) => user.id === req.params.id);

  if (!existingUser) {
    return res.status(404).send("User not found.");
  }

  const updatedUsers = users.map((user) =>
    user.id === req.params.id ? { ...user, ...req.body, id: user.id } : user,
  );

  fs.writeFile(filePath, JSON.stringify(updatedUsers, null, 2), (err) => {
    if (err) {
      return res.status(500).send(`Failed to update ${existingUser.username}`);
    }

    users.length = 0;
    users.push(...updatedUsers);

    return res.status(200).send(`Successfully updated.`);
  });
};

exports.deleteUser = (req, res) => {
  const userToDelete = users.find((user) => user.id === req.params.id);

  if (!userToDelete) {
    return res.status(404).send("User not found");
  }

  const filteredArray = users.filter((user) => user.id !== req.params.id);

  fs.writeFile(filePath, JSON.stringify(filteredArray, null, 2), (err) => {
    if (err) {
      return res.status(500).send("Failed to delete user");
    }

    users.length = 0;
    users.push(...filteredArray);

    res
      .status(200)
      .send(`${userToDelete.username} has been successfully deleted`);
  });
};
