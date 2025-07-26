import express from 'express';
import http from 'http';
import os from 'os';
import { WebSocketServer } from 'ws';
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import diskusage from 'diskusage'; 

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 2999;
const PINGINTERVAL = 1000

app.use(express.static('public'));

// Helper: get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return 'Unknown';
}

// Helper: get CPU usage percentage
let lastCpuInfo = os.cpus();

function getCpuUsage() {
  const cpus = os.cpus();
  let idleDiff = 0;
  let totalDiff = 0;

  for (let i = 0; i < cpus.length; i++) {
    const prev = lastCpuInfo[i].times;
    const curr = cpus[i].times;

    const prevIdle = prev.idle;
    const currIdle = curr.idle;

    const prevTotal = Object.values(prev).reduce((a,b) => a+b, 0);
    const currTotal = Object.values(curr).reduce((a,b) => a+b, 0);

    idleDiff += currIdle - prevIdle;
    totalDiff += currTotal - prevTotal;
  }

  lastCpuInfo = cpus;

  return totalDiff ? (1 - idleDiff / totalDiff) * 100 : 0;
}

// Helper: get RAM usage percentage
function getRamUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  return ((total - free) / total) * 100;
}

// Helper: get free disk space
async function getFreeDiskSpace() {
  try {
    const info = await diskusage.check('/');
    return (info.free / info.total) * 100;
  } catch {
    return null;
  }
}

// Helper: get public IP
async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const json = await res.json();
    return json.ip;
  } catch {
    return 'Unknown';
  }
}

function getRunningServices() {
  const platform = process.platform;

  try {
    if (platform === 'linux') {
      const output = execSync('ps aux', {
        encoding: 'utf8'
      });

      return output
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.split(/\s+/)[0]);
    }

    if (platform === 'win32') {
      const output = execSync('powershell -Command "Get-Service | Where-Object {$_.Status -eq \'Running\'} | Select-Object -ExpandProperty Name"', {
        encoding: 'utf8'
      });

      return output
        .split('\n')
        .filter(line => line.trim());
    }

    return ['Unsupported platform'];
  } catch (err) {
    console.error("Error fetching running services:", err.message);
    return ['Error fetching services'];
  }
}

// Periodically send data to all connected clients
async function broadcastStats() {
  const localIp = getLocalIp();
  const publicIp = await getPublicIp();
  const cpu = getCpuUsage();
  const ram = getRamUsage();
  const disk = await getFreeDiskSpace();
  const services = getRunningServices();

  const stats = {
    localIp,
    publicIp,
    cpuUsage: cpu.toFixed(1),
    ramUsage: ram.toFixed(1),
    freeDiskPercent: disk !== null ? disk.toFixed(1) : 'N/A',
    services
  };

  const data = JSON.stringify(stats);

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

setInterval(broadcastStats, PINGINTERVAL);

server.listen(PORT, () => {
  console.log(`Running information backend on port ${PORT}`);
});
