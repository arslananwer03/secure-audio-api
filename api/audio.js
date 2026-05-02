import https from 'https';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  // 1. Security validation: Check against both Shopify and custom domains
  const isShopify = url.startsWith('https://cdn.shopify.com/');
  const isVoodooBoy = url.includes('voodooboy.com');

  if (!isShopify && !isVoodooBoy) {
    return res.status(403).send('Unauthorized source.');
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline; filename="secure-preview.mp3"');
  res.setHeader('Access-Control-Allow-Origin', '*');

  https.get(url, (audioStream) => {
    let bytesDownloaded = 0;
    
    // Average high-quality MP3 streams at about ~40KB per second.
    // 40 KB/s * 30 seconds = 1,200 KB (approximately 1.25 MB).
    const maxBytes = 1200; 

    audioStream.on('data', (chunk) => {
      bytesDownloaded += chunk.length;
      
      // Once we reach the 30-second threshold, destroy the stream and end the response.
      if (bytesDownloaded > maxBytes) {
        audioStream.destroy();
        res.end();
      } else {
        res.write(chunk);
      }
    });

    audioStream.on('end', () => {
      res.end();
    });

    audioStream.on('error', (err) => {
      console.error('Error streaming data:', err);
      res.status(500).send('Error streaming audio');
    });

  }).on('error', (err) => {
    console.error('Error fetching file:', err);
    res.status(500).send('Failed to load audio file.');
  });
}