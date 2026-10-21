// ─────────────────────────────────────────────────────────────────────────────
// PM2 process file — production deployment for Landmark Inter Gulf
// Workforce, Payroll & Accounts.
//
// USAGE (on your server, after `npm run build`):
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup     // auto-start on server reboot
//
// This file is the SINGLE PLACE where production environment variables live.
// The standalone server (.next/standalone/server.js) does NOT read .env files,
// so every value you would put in .env must be declared here instead.
//
// EDIT THE MARKED LINES, then keep this file private on the server.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      name: 'lig-app',
      cwd: __dirname,
      script: '.next/standalone/server.js',
      exec_mode: 'fork', // SQLite is file-based — keep exactly ONE instance
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',

        // ▼▼ EDIT THIS — where the SQLite database lives (absolute path is safest)
        DATABASE_URL: 'file:/var/www/lig/db/custom.db',

        // Session lifetime in days (1–90). Default 30.
        // SESSION_DAYS: 30,

        // Leave unset for normal HTTPS deployments (Secure cookies ON in
        // production). Set to 'false' only for plain-HTTP private-network use.
        // COOKIE_SECURE: 'true',
      },
      out_file: '/var/log/lig-app.out.log',
      error_file: '/var/log/lig-app.err.log',
      merge_logs: true,
      time: true,
    },
  ],
}
