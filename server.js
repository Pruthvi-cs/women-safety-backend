const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let alerts = [];
let alertId = 1;

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Women Safety API is running!',
    status: 'Active',
    alerts: alerts.length,
    endpoints: {
      'GET /api/alerts': 'Get all alerts',
      'POST /api/alerts': 'Send new alert',
      'GET /api/stats': 'Get system stats'
    }
  });
});

app.post('/api/alerts', (req, res) => {
  try {
    const { deviceId, alertType, location, battery, message } = req.body;
    
    const newAlert = {
      id: alertId++,
      deviceId: deviceId || 'VIRTUAL_DEVICE',
      alertType: alertType || 'sos_emergency',
      location: parseLocation(location),
      battery: battery || 85,
      message: message || 'Emergency alert',
      timestamp: new Date(),
      status: 'active'
    };

    alerts.unshift(newAlert);
    alerts = alerts.slice(0, 50);
    
    console.log('📨 Alert received:', newAlert);
    
    io.emit('newAlert', newAlert);
    
    res.json({
      success: true,
      message: 'Alert processed successfully',
      alert: newAlert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalAlerts: alerts.length,
    status: 'operational',
    server: 'Render'
  });
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.emit('connected', { message: 'Connected to safety server' });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

function parseLocation(locationString) {
  if (typeof locationString === 'string') {
    const [lat, lng] = locationString.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude: lat, longitude: lng };
  }
  return locationString || { latitude: 28.6139, longitude: 77.2090 };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});