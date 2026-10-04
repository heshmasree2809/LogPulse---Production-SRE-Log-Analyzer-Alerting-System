import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-mock-routes',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/health') {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'ok', service: 'LogPulse Analyzer API', uptime: process.uptime(), timestamp: new Date().toISOString() }));
              return;
            }
            if (req.url === '/api/stats') {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                system_health: 'WARNING',
                timestamp: new Date().toISOString(),
                total_requests: 12450,
                status_2xx: 11980,
                status_4xx: 380,
                status_5xx: 90,
                error_rate_percent: 3.78,
                five_xx_rate_percent: 0.72,
                p50_ms: 42.1,
                p95_ms: 328.6,
                top_failing_url: "/api/v1/checkout (HTTP 500 - 64 occurrences)",
                failing_endpoints: [
                  { url: "/api/v1/checkout", method: "POST", status: 500, count: 64, impact: "High - payment transaction abort" },
                  { url: "/api/v1/reports/export", method: "GET", status: 504, count: 26, impact: "Medium - gateway timeout > 60s" },
                  { url: "/api/v1/users/profile", method: "GET", status: 404, count: 210, impact: "Low - missing user lookup" },
                  { url: "/login/legacy", method: "POST", status: 401, count: 170, impact: "Low - invalid auth credentials" }
                ],
                recent_activity: [
                  { timestamp: new Date(Date.now() - 45000).toISOString(), message: "analyze.py parsed 1,240 new nginx access.log lines in 0.08s", level: "INFO" },
                  { timestamp: new Date(Date.now() - 120000).toISOString(), message: "Elevated latency on /api/v1/reports/export (p95 exceeded 1200ms)", level: "WARN" },
                  { timestamp: new Date(Date.now() - 300000).toISOString(), message: "alert.py evaluated 5-min 5xx window (0.72% < 5.0% threshold). No SNS alert dispatched.", level: "OK" }
                ]
              }));
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
