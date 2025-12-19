require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const app = express();
const PORT = 4000;

const client = neon(process.env.DB_URL);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
app.post('/create-user', async function (req, res) {
  const { username, email, password_hash, bio, profile_picture_url } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, bio, profile_picture_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [username, email, password_hash, bio, profile_picture_url]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Username or email already exists',
      });
    }

    res.status(500).json({ error: 'User creation failed' });
  }
});
