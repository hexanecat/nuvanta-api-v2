import express from 'express';
import { getDB } from '../database/connection.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query(
      'SELECT id, username, full_name, role, unit, shift, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    
    const result = await db.query(
      'SELECT id, username, full_name, role, unit, shift, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
});

export { router as userRoutes };
