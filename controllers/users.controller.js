const fs = require("fs");
const path = require("path");
const users = require("../data/usersData.json");

const userFilePath = path.join(__dirname, "../data/usersData.json");

exports.createUser = (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    return res.status(400).send("User 'name' field is required.");
  }

  users.push(newUser);

  fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      users.pop();
      return res.status(500).send("Failed to save user");
    }

    res.status(200).send(`${newUser.name} has been successfully added`);
  });
};

exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

exports.updateUser = (req, res) => {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).send("Must include 'id'.");
  }

  const existingUser = users.find((user) => user.id === id);

  if (!existingUser) {
    return res.status(404).send("User not found.");
  }

  const updatedUsers = users.map((user) =>
    user.id === id ? { ...user, ...updates } : user,
  );

  fs.writeFile(userFilePath, JSON.stringify(updatedUsers, null, 2), (err) => {
    if (err) {
      return res.status(500).send(`Failed to update ${existingUser.name}`);
    }

    users.length = 0;
    users.push(...updatedUsers);

    res.status(200).send(`${existingUser.name} has been successfully updated`);
  });
};

exports.deleteUser = (req, res) => {
  const userToDelete = users.find((user) => user.id === req.params.id);

  if (!userToDelete) {
    return res.status(404).send("User not found");
  }

  const filteredArray = users.filter((user) => user.id !== req.params.id);

  fs.writeFile(userFilePath, JSON.stringify(filteredArray, null, 2), (err) => {
    if (err) {
      return res.status(500).send("Failed to delete user");
    }

    users.length = 0;
    users.push(...filteredArray);

    res.status(200).send(`${userToDelete.name} has been successfully deleted`);
  });
};
