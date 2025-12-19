import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

// High-signal: No need to "connect" or "release" manually
const res = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
console.log(res.rows[0]);
