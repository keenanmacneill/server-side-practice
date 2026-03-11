const express = require("express");
const router = express.Router();

const {
  getNote,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notes.controller");

router.get("/", getAllNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
