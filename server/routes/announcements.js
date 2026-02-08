const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, async (req, res) => {
  try {
    const query = { 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    };

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    const announcements = await Announcement.find(query)
      .populate('subject', 'name code')
      .populate('createdBy', 'name role')
      .sort('-createdAt');

    res.json({
      success: true,
      count: announcements.length,
      announcements
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
    const announcement = await Announcement.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/', protect, authorize('admin'), upload.array('files', 3), async (req, res) => {
  try {
    const { title, content, subject, priority, expiresAt } = req.body;

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path
    })) : [];

    const announcement = await Announcement.create({
      title,
      content,
      subject: subject || null,
      priority,
      expiresAt: expiresAt || null,
      attachments,
      createdBy: req.user.id
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('subject', 'name code')
      .populate('createdBy', 'name');

    req.io.emit('new-announcement', populatedAnnouncement);

    res.status(201).json({
      success: true,
      announcement: populatedAnnouncement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name code').populate('createdBy', 'name');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    req.io.emit('announcement-updated', announcement);

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
