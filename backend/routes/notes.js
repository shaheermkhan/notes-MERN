const express = require('express');
const router = express.Router();
const {getNotes, getSingleNote, createNote, deleteNote, updateNote} = require('../controllers/notes')

router.get('/', getNotes)

router.get('/:id', getSingleNote)

router.post('/', createNote)

router.delete('/:id', deleteNote)

router.patch('/:id', updateNote)

module.exports = router;