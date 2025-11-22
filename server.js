const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage
let alerts = [];

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Women Safety API is running!',
    status: 'Active',
    alerts: alerts.length
  });
});

app.post('/api/alerts', (req, res) => {
  const alert = {
    id: Date.now(),
    ...req.body,
    timestamp: new Date()
  };
  
  alerts.unshift(alert);
  alerts = alerts.slice(0, 50);
  
  res.json({
    success: true,
    message: 'Alert received',
    alert: alert
  });
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
