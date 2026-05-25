const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
let clients = [];

// Helper to rebuild typescript and compile mock transcript
function compile() {
  console.log('⚡ File change detected! Rebuilding and compiling...');
  exec('npm run build && npm run test', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Build error:\n${stderr}`);
      return;
    }
    console.log('✅ Rebuild complete! Refreshing connected browsers...');
    // Notify all connected clients to reload
    clients.forEach(res => res.write('data: reload\n\n'));
  });
}

// Start watching the src/ directory
fs.watch(path.join(__dirname, 'src'), { recursive: true }, (eventType, filename) => {
  if (filename && (filename.endsWith('.html') || filename.endsWith('.ts'))) {
    // Debounce compilation
    clearTimeout(this.watchTimeout);
    this.watchTimeout = setTimeout(compile, 200);
  }
});

// HTTP Server
const server = http.createServer((req, res) => {
  // Server-Sent Events endpoint for hot reloading
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    clients.push(res);
    req.on('close', () => {
      clients = clients.filter(c => c !== res);
    });
    return;
  }

  // Serve test-transcript.html
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'test-transcript.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Transcript not compiled yet. Make a change or run npm run test first!');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Inject hot-reload script into the page dynamically
    const hotReloadScript = `
      <script>
        const sse = new EventSource('/events');
        sse.onmessage = (e) => {
          if (e.data === 'reload') {
            console.log('⚡ Hot reload signal received from dev server!');
            window.location.reload();
          }
        };
      </script>
    `;
    content = content.replace('</body>', `${hotReloadScript}</body>`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
    return;
  }

  // Serve static assets or fall back to mock index
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Nexus Dev Server is running at http://localhost:${PORT}`);
  console.log(`👀 Watching for changes in "src/template/ui.html" and "src/**/*.ts"`);
  console.log(`🔥 Open http://localhost:${PORT} in your browser and edit ui.html to see real-time changes!\n`);
  
  // Initial compilation
  compile();
});
