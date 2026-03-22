const http = require('http');
const net = require('net');

// Configuration
const WSL_GATEWAY_IP = '172.19.160.94';  // Your WSL IP (check with: ip addr show eth0)
const WSL_GATEWAY_PORT = 18898;          // Alfred's OpenClaw gateway port
const LISTEN_PORT = 18900;               // Port accessible from Windows Chrome

const server = http.createServer((req, clientRes) => {
    // 1. Handle CORS Pre-flight
    if (req.method === 'OPTIONS') {
        clientRes.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        });
        clientRes.end();
        return;
    }

    // 2. Proxy the Request to WSL Gateway
    const options = {
        hostname: WSL_GATEWAY_IP,
        port: WSL_GATEWAY_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxyReq = http.request(options, (targetRes) => {
        // 3. Inject CORS Headers into Response
        const headers = { ...targetRes.headers };
        headers['Access-Control-Allow-Origin'] = '*';

        clientRes.writeHead(targetRes.statusCode, headers);
        targetRes.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', (e) => {
        console.error(`Proxy Error: ${e.message}`);
        clientRes.writeHead(502);
        clientRes.end();
    });

    req.pipe(proxyReq, { end: true });
});

// 4. Handle WebSocket Upgrades (Critical for Alfred's Relay!)
server.on('upgrade', (req, clientSocket, head) => {
    console.log(`WebSocket upgrade request: ${req.url}`);

    // Create connection to WSL gateway
    const gatewaySocket = net.connect(WSL_GATEWAY_PORT, WSL_GATEWAY_IP, () => {
        // Forward the upgrade request to the gateway
        let requestHeaders = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;

        for (let i = 0; i < req.rawHeaders.length; i += 2) {
            requestHeaders += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
        }
        requestHeaders += '\r\n';

        gatewaySocket.write(requestHeaders);
        if (head && head.length > 0) {
            gatewaySocket.write(head);
        }
    });

    // Pipe data bidirectionally
    gatewaySocket.on('data', (data) => {
        clientSocket.write(data);
    });

    clientSocket.on('data', (data) => {
        gatewaySocket.write(data);
    });

    // Handle errors and cleanup
    gatewaySocket.on('error', (err) => {
        console.error(`Gateway socket error: ${err.message}`);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error(`Client socket error: ${err.message}`);
        gatewaySocket.end();
    });

    gatewaySocket.on('end', () => clientSocket.end());
    clientSocket.on('end', () => gatewaySocket.end());
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
    console.log(`
========================================
Alfred CORS Proxy Running
========================================
Listening:  0.0.0.0:${LISTEN_PORT}
Forwarding: ${WSL_GATEWAY_IP}:${WSL_GATEWAY_PORT}

Chrome Extension Config:
  URL: http://localhost:${LISTEN_PORT}

WSL Gateway:
  ${WSL_GATEWAY_IP}:${WSL_GATEWAY_PORT}
========================================
    `);
});
