const accessToken = window.location.hash
  .substring(1)
  .split('&')
  .find(param => param.startsWith('access_token'))
  ?.split('=')[1];

const urlParts = window.location.pathname.split('/');
const shareId = urlParts[urlParts.length - 1];
const card = document.getElementById('spotify-card');

function formatFollowers(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num;
}

function copyShareLink() {
  const shareURL = `${window.location.origin}/dashboard/${shareId}`;
  navigator.clipboard.writeText(shareURL).then(() => {
    alert('Sharable link copied to clipboard!');
  });
}

if (accessToken || shareId) {
  if (!accessToken && shareId) {
    fetch(`/api/token/${shareId}`)
      .then(res => {
        if (!res.ok) throw new Error('Token not found');
        return res.json();
      })
      .then(data => {
        loadSpotifyData(data.access_token);
      })
      .catch(() => {
        card.innerHTML = '<h2>Invalid or expired share link</h2>';
      });
  } else {
    loadSpotifyData(accessToken);
  }
} else {
  card.innerHTML = '<h2>No access token found</h2>';
}

function loadSpotifyData(token) {
  fetch('/api/spotify/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const { profile, topArtists, topTracks } = data;
      const topGenre = topArtists[0]?.genres?.[0] || 'N/A';
      const topTrack = topTracks[0];

      card.innerHTML = `
        <h2>${profile.display_name}</h2>
        <img src="${profile.images[0]?.url || 'https://via.placeholder.com/100'}" width="120" />
        <p><strong>Followers:</strong> ${formatFollowers(profile.followers.total)}</p>
        <p><strong>Country:</strong> ${profile.country}</p>
        <p><strong>Account Type:</strong> ${profile.product}</p>
        <h3>Top Artists</h3>
        <ul>${topArtists.map(a => `<li>${a.name}</li>`).join('')}</ul>
        <h3>Top Tracks</h3>
        <ul>${topTracks.map(t => `<li>${t.name} - ${t.artists.map(a => a.name).join(', ')}</li>`).join('')}</ul>
        ${topTrack.preview_url ? `<audio controls src="${topTrack.preview_url}" style="margin-top:1rem;"></audio>` : ''}
        <p><a href="${profile.external_urls.spotify}" target="_blank">Open Spotify Profile ↗</a></p>
        <button id="share-btn" class="share-btn">Share this card</button>
      `;

      document.getElementById('share-btn').addEventListener('click', copyShareLink);
    })
    .catch(() => {
      card.innerHTML = '<h2>Failed to load Spotify data</h2>';
    });
}

const wrapper = document.querySelector('.card-wrapper');
const rotateCard = document.querySelector('.card-3d');

if (rotateCard) {
  wrapper.addEventListener('mousemove', (e) => {
    const bounds = rotateCard.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
const rotateX = ((y - centerY) / centerY) * 4;
const rotateY = ((x - centerX) / centerX) * 4;
    rotateCard.style.transform = `rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    rotateCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}
