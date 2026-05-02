import https from 'https';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  // 1. Check against both Shopify and your custom domains
  const isShopify = url.startsWith('https://cdn.shopify.com/');
  const isVoodooBoy = url.includes('voodooboy.com');

  if (!isShopify && !isVoodooBoy) {
    return res.status(403).send('Unauthorized source.');
  }

  // Apply security and caching response headers
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline; filename="secure-preview.mp3"');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Stream the file directly to the client
  https.get(url, (audioStream) => {
    audioStream.pipe(res);
  }).on('error', (err) => {
    console.error('Error fetching stream:', err);
    res.status(500).send('Failed to load audio file.');
  });
}