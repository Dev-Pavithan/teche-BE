// routes/contactRoutes.js
import express from 'express';
import Contact from '../models/Contact.js';
import { body, validationResult } from 'express-validator';
import authenticate from '../middleware/authenticate.js'; // Middleware for authentication
import checkAdminRole from '../middleware/checkAdminRole.js'; // Middleware to check admin role

const router = express.Router();

// Middleware for input validation
const validateContact = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required.'),
  body('message').notEmpty().withMessage('Message is required.'),
];

// Create a new contact message
router.post('/', validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact message submitted successfully!' });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Get all contact messages (Admin only)
router.get('/', authenticate, checkAdminRole, async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Get a specific contact message by ID (Admin only)
router.get('/:id', authenticate, checkAdminRole, async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found.' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

export default router;

