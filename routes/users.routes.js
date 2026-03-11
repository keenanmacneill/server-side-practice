const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
