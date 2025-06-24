import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { tokenStore, generateId } from './utils.js';

const router = express.Router();
const scope = 'user-top-read user-read-private';

router.get('/login', (req, res) => {
  console.log('GET /auth/login hit');
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  const body = querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  const headers = {
    Authorization:
      'Basic ' +
      Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body,
      { headers }
    );

    const { access_token } = response.data;

    let id = generateId();
    while (tokenStore.has(id)) {
      id = generateId();
    }
    tokenStore.set(id, access_token);

    res.redirect(`/dashboard/${id}`);
  } catch (err) {
    res.send('Error authenticating');
  }
});

export default router;
