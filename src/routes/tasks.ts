import express from 'express';
import { getDB } from '../database/connection.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query(`
      SELECT 
        t.*,
        u1.full_name as assigned_to_name,
        u2.full_name as created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      tasks: result.rows
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }

    const db = getDB();
    const result = await db.query(`
      INSERT INTO tasks (title, description, priority, assigned_to, due_date, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [title, description || null, priority || 'medium', assignedTo || null, dueDate || null, 1]); // TODO: Get created_by from auth

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task' 
    });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const db = getDB();
    
    // Build dynamic query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
      
      // If marking as completed, set completed_at
      if (status === 'completed') {
        updates.push(`completed_at = $${paramCount++}`);
        values.push(new Date());
      }
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assignedTo);
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(dueDate);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update task' 
    });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete task' 
    });
  }
});

export { router as taskRoutes };
