import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './auth.js';
import { tokenStore } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRouter);

app.get('/api/token/:id', (req, res) => {
  const { id } = req.params;
  const token = tokenStore.get(id);
  if (!token) return res.status(404).json({ error: 'Not found' });
  res.json({ access_token: token });
});

app.get('/api/spotify/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const access_token = auth.split(' ')[1];
    const headers = { Authorization: `Bearer ${access_token}` };

    const profileRes = await fetch('https://api.spotify.com/v1/me', { headers });
    if (!profileRes.ok) throw new Error('Profile fetch failed');
    const profile = await profileRes.json();

    const artistsRes = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', { headers });
    if (!artistsRes.ok) throw new Error('Top artists fetch failed');
    const topArtists = await artistsRes.json();

    const tracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', { headers });
    if (!tracksRes.ok) throw new Error('Top tracks fetch failed');
    const topTracks = await tracksRes.json();

    res.json({ profile, topArtists: topArtists.items, topTracks: topTracks.items });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch Spotify data' });
  }
});

app.get('/dashboard/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
