import https from 'https';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  // Security validation: Only allow Shopify CDN URLs to prevent unauthorized use
  if (!url.startsWith('https://cdn.shopify.com/')) {
    return res.status(403).send('Unauthorized source.');
  }

  // Apply security and caching response headers
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline; filename="secure-preview.mp3"');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Stream the file directly from Shopify's CDN without exposing the path
  https.get(url, (audioStream) => {
    audioStream.pipe(res);
  }).on('error', (err) => {
    console.error('Error fetching stream:', err);
    res.status(500).send('Failed to load audio file.');
  });
}