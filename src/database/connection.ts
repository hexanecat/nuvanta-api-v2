import { Pool } from 'pg';

let pool: Pool;

export async function initDatabase() {
  try {
    // Initialize PostgreSQL connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://mike@localhost:5432/nuvanta_v2',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Create tables if they don't exist
    await createTables();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getDB() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'nurse',
        unit VARCHAR(50),
        shift VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(10) DEFAULT 'medium',
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        due_date TIMESTAMP
      )
    `);

    // Calendar events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date TIMESTAMP NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created/verified');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}
