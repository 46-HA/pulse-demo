import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/me', async (req, res) => {
    const token = req.headers.authorization;

  try {
    const [profile, topTracks, topArtists] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: token },
      }),
      axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
        headers: { Authorization: token },
      }),
      axios.get('https://api.spotify.com/v1/me/top/artists?limit=5', {
        headers: { Authorization: token },
      }),
    ]);

    res.json({
      profile: profile.data,
      topTracks: topTracks.data.items,
      topArtists: topArtists.data.items,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Spotify data' });
  }
});

export default router;
