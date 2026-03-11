const express = require("express");
const router = express.Router();

const {
  getUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

router.get("/:id", getUser);
router.get("/", getAllUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
