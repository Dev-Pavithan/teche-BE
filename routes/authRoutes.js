// routes/userRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import checkAdminRole from '../middleware/checkAdminRole.js';
import sendMail from '../utils/sendMail.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    // Send welcome email after successful registration
    const welcomeMessage = `
      <h1>Welcome to Tech-E! We’re excited to have you join our community.</h1>
      <p>Tech-E is more than just an assistant—it’s a lifelike AI companion designed to support you in your coding, productivity, and overall well-being. Whether you're tackling a tough project or seeking balance in your work life, Tech-E is here to help.</p>
      <p>Start exploring how Tech-E can make a difference in your daily routine.</p>
      <p>Cheers,<br/>Tech-E.</p>`;

    // Send the email
    await sendMail(
      email,
      'Welcome to Tech-E: Your AI Companion is Here!',
      `Welcome to Our Platform, ${name}! We're glad to have you here.`,
      welcomeMessage
    );

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookie (optional, depends on your authentication strategy)
    res.cookie('token', token, { httpOnly: true });

    // Send back relevant user data along with the token
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
});

// Logout a user
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production' });
  console.log('Logout successful');
  res.status(200).json({ message: 'Logout successful!' });
});

// Get all users (Admin only)
router.get('/all', authenticate, checkAdminRole, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from the response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


// Get a specific user (Admin only)
router.get('/:id', authenticate, checkAdminRole, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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
