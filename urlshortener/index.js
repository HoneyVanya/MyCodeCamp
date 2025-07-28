require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns')
const app = express();

const urls = []

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;

  try {
    const urlObj = new URL(inputUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' })
      };

      const shortUrl = urls.length + 1;
      urls.push({ original_url: inputUrl, short_url: shortUrl });

      res.json({
        original_url: inputUrl,
        short_url: shortUrl
      });
    });
  } catch {
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const record = urls.find(u => u.short_url === short); 

  if (record) {
    res.redirect(record.original_url)
  } else {
    res.status(404).json({ error: 'No short URL found for given input' })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
