const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

const {
  getNote,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/notes.controller');

router.post('/', requireAuth, createNote);
router.get('/', getAllNotes);
router.get('/:id', getNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
