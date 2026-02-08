const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

router.get('/', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    const notes = await Note.find(query)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/', protect, authorize('admin'), upload.array('files', 10), async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    }));

    const note = await Note.create({
      title,
      description,
      subject,
      files,
      uploadedBy: req.user.id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name');

    req.io.emit('new-note', populatedNote);

    res.status(201).json({
      success: true,
      note: populatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/download/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.downloads += 1;
    await note.save();

    const fileIndex = parseInt(req.query.fileIndex) || 0;
    const file = note.files[fileIndex];

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
