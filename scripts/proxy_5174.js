const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5173'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end('Proxying to Vite server: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(5174, '0.0.0.0', () => {
  console.log('Dual-port proxy running on 0.0.0.0:5174 -> 5173');
});
