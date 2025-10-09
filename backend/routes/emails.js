const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { User, Email } = require('../models');
const ImapService = require('../services/imapService');
const GoogleAuthService = require('../services/googleAuthService');

const router = express.Router();
const googleAuthService = new GoogleAuthService();

// Get emails from Gmail and sync with database
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.body;

    // Check if token needs refresh
    if (googleAuthService.isTokenExpired(req.user)) {
      await googleAuthService.refreshAccessToken(req.user);
      await req.user.reload();
    }

    // Create IMAP service instance
    const imapService = new ImapService(req.user);
    
    // Fetch emails from Gmail
    const emails = await imapService.getEmails(limit);

    // Store emails in database
    const savedEmails = [];
    for (const email of emails) {
      const [savedEmail, created] = await Email.findOrCreate({
        where: { messageId: email.messageId },
        defaults: {
          userId: req.user.id,
          messageId: email.messageId,
          uid: email.uid,
          from: email.from,
          to: email.to,
          subject: email.subject,
          date: email.date,
          size: email.size,
          body: email.body,
          htmlBody: email.htmlBody,
          attachments: email.attachments,
          flags: email.flags
        }
      });

      if (created) {
        savedEmails.push(savedEmail);
      }
    }

    res.json({
      message: `Synced ${savedEmails.length} new emails`,
      emails: savedEmails
    });
  } catch (error) {
    console.error('Email sync error:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
});

// Get emails from database
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, folder = 'INBOX' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { userId: req.user.id, folder };

    // Add search functionality
    if (search) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { subject: { [require('sequelize').Op.like]: `%${search}%` } },
          { from: { [require('sequelize').Op.like]: `%${search}%` } },
          { body: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: emails } = await Email.findAndCountAll({
      where: whereClause,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['htmlBody'] } // Exclude large HTML content for list view
    });

    res.json({
      emails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalEmails: count,
        hasNext: offset + emails.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get specific email
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const email = await Email.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Mark as read
    if (!email.isRead) {
      await email.update({ isRead: true });
    }

    res.json(email);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Mark email as read/unread
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { isRead } = req.body;

    const email = await Email.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    await email.update({ isRead });

    res.json({ message: `Email marked as ${isRead ? 'read' : 'unread'}` });
  } catch (error) {
    console.error('Update email read status error:', error);
    res.status(500).json({ error: 'Failed to update email status' });
  }
});

// Mark email as important/unimportant
router.patch('/:id/important', authenticateToken, async (req, res) => {
  try {
    const { isImportant } = req.body;

    const email = await Email.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    await email.update({ isImportant });

    res.json({ message: `Email marked as ${isImportant ? 'important' : 'not important'}` });
  } catch (error) {
    console.error('Update email importance error:', error);
    res.status(500).json({ error: 'Failed to update email importance' });
  }
});

// Delete email
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const email = await Email.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    await email.destroy();

    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Get email statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalEmails = await Email.count({
      where: { userId: req.user.id }
    });

    const unreadEmails = await Email.count({
      where: { userId: req.user.id, isRead: false }
    });

    const importantEmails = await Email.count({
      where: { userId: req.user.id, isImportant: true }
    });

    const recentEmails = await Email.count({
      where: {
        userId: req.user.id,
        date: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      totalEmails,
      unreadEmails,
      importantEmails,
      recentEmails
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to fetch email statistics' });
  }
});

module.exports = router;
