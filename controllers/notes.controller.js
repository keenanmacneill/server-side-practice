const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../data/notesData.json");
const notes = require(filePath);

exports.createNote = (req, res) => {
  const { id, title, content, location, userId } = req.body;

  if (!id || !title || !content || !location || !userId) {
    return res.status(400).send("All fields must be completed.");
  }

  notes.push(req.body);

  fs.writeFile(filePath, JSON.stringify(notes, null, 2), (err) => {
    if (err) {
      console.log(err);
      notes.pop();
      return res.status(500).send("Failed to save note");
    }
    return res
      .status(200)
      .send(`'${title}' at ${location} has been successfully added.`);
  });
};

exports.getAllNotes = (req, res) => {
  res.status(200).json(notes);
};

exports.getNote = (req, res) => {
  const targetNote = notes.find((n) => n.id === req.params.id);

  if (!targetNote) {
    return res.status(404).send("Note not found.");
  }

  return res.status(200).json(targetNote);
};

exports.updateNote = (req, res) => {};

exports.deleteNote = (req, res) => {};
