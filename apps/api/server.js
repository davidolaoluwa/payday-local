'use strict';
const express = require('express');
const helmet = require('helmet');
const client = require('prom-client');
const winston = require('winston');
 
const log = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});
 
const app = express();
app.use(helmet());
 
// --- Prometheus metrics ---
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
const httpRequests = new client.Counter({
  name: 'payday_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [registry]
});
 
app.use((req, res, next) => {
  res.on('finish', () => httpRequests.inc({
    method: req.method, route: req.path, status: res.statusCode
  }));
  next();
});
 
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
app.get('/api/payments', (_req, res) =>
  res.json([{ id: 1, amount: 4200, currency: 'USD', status: 'settled' }]));
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log.info({ msg: 'api listening', port: PORT }));
