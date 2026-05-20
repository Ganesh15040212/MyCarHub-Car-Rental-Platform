import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

const router = express.Router();

// Temporary memory fallback in case MongoDB is offline
let memoryAdmin = null;

// GET admin setup status (returns whether first-time setup is required)
router.get('/setup-status', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Offline mode: check if memoryAdmin is already set up
      const isSetupRequired = !memoryAdmin;
      return res.json({ isSetupRequired });
    }

    const adminCount = await Admin.countDocuments();
    res.json({ isSetupRequired: adminCount === 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST first-time setup (registers the first admin account)
router.post('/setup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      // Offline mode: store first-time setup credentials in-memory
      memoryAdmin = { email: email.toLowerCase(), password }; // stored as plaintext or mock
      console.log(`🚀 Standalone Offline mode setup completed! Registered memory email: ${email}`);
      return res.status(201).json({ message: 'Offline admin credentials registered successfully' });
    }

    // Check if an admin already exists in the database
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Setup already completed. Admin account exists.' });
    }

    // Create and save new Admin
    const admin = new Admin({
      email,
      password
    });

    await admin.save();
    res.status(201).json({ message: 'Executive Admin account established successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST secure admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Offline/Memory Database Fallback mode
    if (mongoose.connection.readyState !== 1) {
      if (memoryAdmin) {
        if (cleanEmail === memoryAdmin.email && password === memoryAdmin.password) {
          const token = jwt.sign(
            { email: memoryAdmin.email, role: 'admin' },
            process.env.JWT_SECRET || 'mycarhub_super_secret_jwt_key_2026',
            { expiresIn: '30d' }
          );
          return res.json({ token, message: 'Authentication successful (Offline Fallback)' });
        }
        // Double fallback if setup hasn't run yet: allow admin@mycarhub.com / adminPassword123
        if (cleanEmail === 'admin@mycarhub.com' && password === 'adminPassword123') {
          const token = jwt.sign(
            { email: cleanEmail, role: 'admin' },
            process.env.JWT_SECRET || 'mycarhub_super_secret_jwt_key_2026',
            { expiresIn: '30d' }
          );
          return res.json({ token, message: 'Default Authentication successful (Offline Default)' });
        }
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Standard MERN Stack Database Mode
    const admin = await Admin.findOne({ email: cleanEmail });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token for secure sessions
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'mycarhub_super_secret_jwt_key_2026',
      { expiresIn: '30d' }
    );

    res.json({ token, message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET verify token (used by admin-panel to check session validity)
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'No authorization token supplied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'mycarhub_super_secret_jwt_key_2026'
    );
    res.json({ valid: true, decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

export default router;
