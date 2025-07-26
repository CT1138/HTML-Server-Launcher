// Read from environment variables, with defaults as fallback
const BACKENDHOSTNAME = process.env.SRVHOST || "localhost";
const PORT = process.env.SRVPORT || 3001;

document.addEventListener('DOMContentLoaded', () => {
  const statsEl = document.querySelector('.system-stats');
  const servicesListEl = document.querySelector('#services-list');

  const ws = new WebSocket(`ws://${BACKENDHOSTNAME}:${PORT}/ws/`);

  ws.onmessage = event => {
    const stats = JSON.parse(event.data);

    // Translate json stats into readable stuff
    statsEl.textContent = 
      `Local IP: ${stats.localIp} | Public IP: ${stats.publicIp} | ` +
      `CPU: ${stats.cpuUsage}% | RAM: ${stats.ramUsage}% | Free Disk: ${stats.freeDiskPercent}%`;

    servicesListEl.innerHTML = '';

    // Start filling out service lists
    if (Array.isArray(stats.services)) {
      stats.services.forEach(service => {
        const li = document.createElement('li');
        li.textContent = service;
        servicesListEl.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No service data available';
      servicesListEl.appendChild(li);
    }
  };

  // If something goes wrong
  ws.onerror = () => {
    statsEl.textContent = 'Failed to load system stats.';
  };
});
