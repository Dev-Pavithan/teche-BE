import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import checkAdminRole from '../middleware/checkAdminRole.js';
import sendMail from '../utils/sendMail.js'; // Ensure sendMail is implemented
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Register a new user
router.post('/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(400).json({ error: 'User already exists.' });
      }

      const newUser = new User({ name, email, password });
      await newUser.save();

      const welcomeMessage = `
        <h1>Welcome to Tech-E!</h1>
        <p>We’re excited to have you join our community.</p>
        <p>Cheers,<br/>Tech-E.</p>`;

      await sendMail(
        email,
        'Welcome to Tech-E!',
        `Welcome to Our Platform, ${name}!`,
        welcomeMessage
      );

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  }
);

// Login a user
router.post('/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.status(200).json({
        message: 'Login successful!',
        token,
        userId: user._id,
        role: user.role,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  }
);

// Logout a user
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logout successful!' });
});

// Get all users (Admin only)
router.get('/all', authenticate, checkAdminRole, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Get a specific user by email (Admin only)
router.get('/by-email/:email', authenticate, checkAdminRole, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Block a user (Admin only)
router.patch('/:id/block', authenticate, checkAdminRole, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.blocked = !user.blocked;
    await user.save();
    res.status(200).json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully!` });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

export default router;
