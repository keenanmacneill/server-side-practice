const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../data/notesData.json');
const notes = require(filePath);

exports.createNote = (req, res) => {
  const { id, title, content, location, userId } = req.body;
  if (!id || !title || !content || !location || !userId) {
    return res.status(400).send('All fields must be completed.');
  }

  notes.push(req.body);

  fs.writeFile(filePath, JSON.stringify(notes, null, 2), err => {
    if (err) {
      console.log(err);
      notes.pop();
      return res.status(500).send('Failed to save note');
    }
    return res.status(200).send(`'${title}' at ${location} has been successfully added.`);
  });
};

exports.getAllNotes = (req, res) => {
  res.status(200).json(notes);
};

exports.getNote = (req, res) => {
  const targetNote = notes.find(n => String(n.id) === req.params.id);
  if (!targetNote) {
    return res.status(404).send('Note not found.');
  }

  return res.status(200).json(targetNote);
};

exports.updateNote = (req, res) => {
  const existingNote = notes.find(n => n.id === req.params.id);
  if (!existingNote) {
    return res.status(404).send('Note not found.');
  }

  const updatedNotes = notes.map(n =>
    n.id === req.params.id ? { ...n, ...req.body, id: n.id } : n,
  );

  const updatedNote = updatedNotes.find(n => n.id === req.params.id);

  fs.writeFile(filePath, JSON.stringify(updatedNotes, null, 2), err => {
    if (err) {
      return res
        .status(500)
        .send(`Failed to update ${existingNote.title} at ${existingNote.location}`);
    }

    notes.length = 0;
    notes.push(...updatedNotes);

    return res
      .status(200)
      .send(`Successfully updated ${updatedNote.title} at ${updatedNote.location}`);
  });
};

exports.deleteNote = (req, res) => {
  const noteToDelete = notes.find(n => n.id === req.params.id);
  if (!noteToDelete) {
    return res.status(404).send('Note not found');
  }

  const updatedNotes = notes.filter(n => n.id !== req.params.id);

  fs.writeFile(filePath, JSON.stringify(updatedNotes, null, 2), err => {
    if (err) {
      return res.status(500).send('Internal server error');
    }

    notes.length = 0;
    notes.push(...updatedNotes);

    return res
      .status(200)
      .send(`'${noteToDelete.title}' at ${noteToDelete.location} was successfully deleted`);
  });
};
