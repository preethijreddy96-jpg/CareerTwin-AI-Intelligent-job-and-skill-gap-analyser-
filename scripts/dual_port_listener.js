const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5174,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5174'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ detail: 'Proxy error forwarding 5173 to 5174: ' + err.message }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(5173, '0.0.0.0', () => {
  console.log('Port 5173 forwarder active: 0.0.0.0:5173 -> 5174');
});
