const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'services.json');
const HISTORY_FILE = path.join(DATA_DIR, 'ping-history.json');

app.use(express.json());

// Load/save services
function loadServices() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function saveServices(services) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(services, null, 2));
}

// Ping history persisted to disk: { [serviceId]: [{time, ok}] }
function loadPingHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return {}; }
}

function savePingHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
}

let pingHistory = loadPingHistory();

function pingUrl(url) {
  return new Promise((resolve) => {
    try {
      const start = Date.now();
      const mod = url.startsWith('https') ? https : http;
      const options = { timeout: 5000, rejectUnauthorized: false };
      const req = mod.get(url, options, (res) => {
        const ms = Date.now() - start;
        resolve({ ok: true, ms });
        res.resume();
      });
      req.on('error', () => resolve({ ok: false, ms: null }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, ms: null }); });
    } catch { resolve({ ok: false, ms: null }); }
  });
}

async function pingAll() {
  const services = loadServices();
  for (const svc of services) {
    const result = await pingUrl(svc.url);
    if (!pingHistory[svc.id]) pingHistory[svc.id] = [];
    pingHistory[svc.id].push({ time: Date.now(), ok: result.ok, ms: result.ms });
    // Keep last 10 min = 10 entries (1/min)
    if (pingHistory[svc.id].length > 10) pingHistory[svc.id].shift();
  }
  savePingHistory(pingHistory);
}

// Ping every minute
pingAll();
setInterval(pingAll, 60 * 1000);

// API routes
app.get('/api/services', (req, res) => {
  const services = loadServices();
  res.json(services);
});

app.post('/api/services', (req, res) => {
  const { name, url, icon, group } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url required' });
  const services = loadServices();
  const id = Date.now().toString();
  services.push({ id, name, url, icon: icon || '', group: group || '' });
  saveServices(services);
  pingHistory[id] = [];
  savePingHistory(pingHistory);
  res.json({ id, name, url, icon, group: group || '' });
});

app.put('/api/services/reorder', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  const services = loadServices();
  const map = {};
  for (const svc of services) map[svc.id] = svc;
  const reordered = ids.map(id => map[id]).filter(Boolean);
  saveServices(reordered);
  res.json({ ok: true });
});

app.put('/api/services/:id', (req, res) => {
  const { name, url, icon, group } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url required' });
  const services = loadServices();
  const idx = services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  services[idx] = { ...services[idx], name, url, icon: icon || '', group: group || '' };
  saveServices(services);
  res.json(services[idx]);
});

app.delete('/api/services/:id', (req, res) => {
  let services = loadServices();
  services = services.filter(s => s.id !== req.params.id);
  saveServices(services);
  delete pingHistory[req.params.id];
  savePingHistory(pingHistory);
  res.json({ ok: true });
});

app.get('/api/ping-history', (req, res) => {
  res.json(pingHistory);
});

// Ping immédiat à la demande
app.get('/api/ping-now', async (req, res) => {
  await pingAll();
  res.json({ ok: true });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
