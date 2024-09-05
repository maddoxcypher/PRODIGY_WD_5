require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const https = require('https');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,weatherCode,humidity,windSpeed,precipitationProbability&timesteps=1h&units=metric&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

app.get('/geocode', async (req, res) => {
  const { location } = req.query;
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.results && jsonData.results.length > 0) {
          res.json(jsonData);
        } else {
          res.status(404).json({ error: 'Location not found' });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Failed to geocode location', details: error.message });
      }
    });

  }).on("error", (err) => {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Failed to geocode location', details: err.message });
  });
});

function testOpenCageAPI() {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=London&key=${apiKey}`;

  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      console.log('OpenCage API Test Response:', data);
    });

  }).on("error", (err) => {
    console.log("OpenCage API Test Error: " + err.message);
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  testOpenCageAPI();
});