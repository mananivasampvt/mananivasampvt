const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchProperty(id) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/real-estate-ee44e/databases/(default)/documents/properties/${id}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Extract property ID from query (Vercel parses path segments as query params based on rewrite)
  // For /property/123, Vercel rewrite maps it to id=123
  const { id } = req.query;
  
  // Read the built index.html
  let html = '';
  try {
    // In Vercel, the dist folder is published
    html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
  } catch (err) {
    try {
      // Fallback for dev environments
      html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    } catch (e) {
      return res.status(500).send('Error reading index.html');
    }
  }

  if (!id) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  try {
    const property = await fetchProperty(id);
    
    if (property && property.fields) {
      // Extract data safely
      const rawTitle = property.fields.title?.stringValue || 'Mana Nivasam Property';
      const rawDescription = property.fields.description?.stringValue || 'Check out this premium property on Mana Nivasam';
      const location = property.fields.location?.stringValue || '';
      const price = property.fields.price?.stringValue || '';
      
      // Clean up description (remove HTML/markdown if any)
      const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '');
      const description = truncateString(cleanDescription, 160);
      
      // Create a nice title
      const title = `${rawTitle} | ${location ? location + ' | ' : ''}${price}`;

      let image = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=1200';
      if (property.fields.images && property.fields.images.arrayValue && property.fields.images.arrayValue.values && property.fields.images.arrayValue.values.length > 0) {
        image = property.fields.images.arrayValue.values[0].stringValue;
      }

      const host = req.headers.host || 'mananivasam.in';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const propertyUrl = `${protocol}://${host}/property/${id}`;

      // Replace the meta tags in HTML
      html = html.replace(
        /<meta[^>]*property="og:title"[^>]*>/i,
        `<meta property="og:title" content="${title}" />`
      );
      html = html.replace(
        /<meta[^>]*property="og:description"[^>]*>/i,
        `<meta property="og:description" content="${description}" />`
      );
      html = html.replace(
        /<meta[^>]*property="og:image"[^>]*>/i,
        `<meta property="og:image" content="${image}" />`
      );
      
      if (/<meta[^>]*property="og:url"[^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property="og:url"[^>]*>/i,
          `<meta property="og:url" content="${propertyUrl}" />`
        );
      } else {
        html = html.replace(
          '</head>',
          `  <meta property="og:url" content="${propertyUrl}" />\n  </head>`
        );
      }
      
      // Also replace Twitter tags
      html = html.replace(
        /<meta[^>]*name="twitter:image"[^>]*>/i,
        `<meta name="twitter:image" content="${image}" />`
      );
      
      // Update standard title and description for good measure
      html = html.replace(
        /<title>.*?<\/title>/i,
        `<title>${title}</title>`
      );
      html = html.replace(
        /<meta[^>]*name="description"[^>]*>/i,
        `<meta name="description" content="${description}" />`
      );
    }
  } catch (error) {
    console.error('Error processing dynamic meta tags:', error);
  }

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).send(html);
};
