// PM2 Production Config — Hostinger VPS
module.exports = {
  apps: [
    {
      name: 'adswadi-api',
      script: 'index.js',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
    },
  ],
}
