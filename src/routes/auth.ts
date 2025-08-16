import express from 'express';
import bcrypt from 'bcrypt';
import { getDB } from '../database/connection.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const db = getDB();
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, role, unit, shift } = req.body;

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, password, fullName, and role are required' 
      });
    }

    const db = getDB();
    
    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db.query(
      `INSERT INTO users (username, password_hash, full_name, role, unit, shift) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, full_name, role, unit, shift, created_at`,
      [username, passwordHash, fullName, role, unit || null, shift || null]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export { router as authRoutes };
