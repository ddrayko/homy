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
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

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

// Config
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return { webhookUrl: '', webhookCooldown: 5 };
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return { webhookUrl: '', webhookCooldown: 5 }; }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Webhook
const lastNotified = {};

function sendWebhook(payload) {
  const config = loadConfig();
  if (!config.webhookUrl) return;
  const body = JSON.stringify(payload);
  try {
    const url = new URL(config.webhookUrl);
    const mod = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 5000
    };
    const req = mod.request(options);
    req.write(body);
    req.end();
  } catch {}
}

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

let previousState = {};

async function pingAll() {
  const services = loadServices();
  const config = loadConfig();
  const now = Date.now();

  for (const svc of services) {
    const result = await pingUrl(svc.url);
    if (!pingHistory[svc.id]) pingHistory[svc.id] = [];
    pingHistory[svc.id].push({ time: now, ok: result.ok, ms: result.ms });
    if (pingHistory[svc.id].length > 10) pingHistory[svc.id].shift();

    if (config.webhookUrl) {
      const prevOk = previousState[svc.id];
      if (prevOk !== undefined && prevOk !== result.ok) {
        const lastSent = lastNotified[svc.id] || 0;
        const cooldown = (config.webhookCooldown || 5) * 60 * 1000;
        if (now - lastSent >= cooldown) {
          lastNotified[svc.id] = now;
          sendWebhook({
            embeds: [{
              title: result.ok ? 'Service Back Online' : 'Service Down',
              description: `${svc.name} is now ${result.ok ? 'online' : 'offline'}`,
              color: result.ok ? 5047138 : 16711680,
              fields: [
                { name: 'Service', value: svc.name, inline: true },
                { name: 'URL', value: svc.url, inline: true },
                { name: 'Status', value: result.ok ? 'Online' : 'Offline', inline: true },
                ...(result.ok ? [{ name: 'Latency', value: `${result.ms}ms`, inline: true }] : [])
              ],
              timestamp: new Date().toISOString()
            }]
          });
        }
      }
      previousState[svc.id] = result.ok;
    }
  }
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

app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json(config);
});

app.put('/api/config', (req, res) => {
  const { webhookUrl, webhookCooldown } = req.body;
  const config = loadConfig();
  config.webhookUrl = typeof webhookUrl === 'string' ? webhookUrl : config.webhookUrl;
  config.webhookCooldown = typeof webhookCooldown === 'number' ? webhookCooldown : config.webhookCooldown;
  saveConfig(config);
  res.json(config);
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
